const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const calculateCompletion = (profile) => {
  if (!profile) return 0;
  const fields = [
    'name', 'gender', 'religion', 'community', 
    'education', 'job', 'location', 'city', 'diet', 'habits', 'familyType',
    'dob', 'height'
  ];
  let filled = fields.filter(f => profile[f]).length;
  if (profile.photos) filled += 1;
  return Math.round((filled / (fields.length + 1)) * 100);
};

const calculateCompatibility = (me, other) => {
  let score = 60; // Base score
  if (me.religion === other.religion) score += 10;
  if (me.city === other.city) score += 10;
  if (me.diet === other.diet) score += 10;
  
  const ageDiff = Math.abs(me.age - other.age);
  if (ageDiff <= 5) score += 10;
  
  return Math.min(score, 100);
};

exports.getMe = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      profile,
      completion: calculateCompletion(profile)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            isVerified: true,
            status: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get Profile By ID Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMatches = async (req, res) => {
  try {
    const matches = await prisma.user.findMany({
      where: {
        id: { not: req.user.id },
        status: 'ACTIVE',
        isVerified: true
      },
      include: {
        profile: true
      }
    });

    const me = await prisma.profile.findUnique({ where: { userId: req.user.id } });

    // We can still calculate compatibility on the fly
    const scoredMatches = matches.map(matchUser => {
      const match = matchUser.profile;
      if (!match || !me) return null;
      
      const score = calculateCompatibility(me, match);
      return {
        id: matchUser.id,
        name: match.name,
        age: match.age,
        location: match.city || match.location,
        job: match.job,
        compatibility: score,
        photo: match.photos ? match.photos.split(',')[0] : null
      };
    }).filter(m => m !== null);

    res.json(scoredMatches);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.saveProfile = async (req, res) => {
  try {
    const rawData = req.body;
    const userId = req.user.id;

    // List of allowed fields in Prisma schema (strictly matches Profile model)
    const allowedFields = [
      'name', 'about', 'age', 'gender', 'religion', 'community', 'subCommunity',
      'education', 'job', 'location', 'city', 'income', 'diet', 'habits', 'smoking', 'drinking',
      'familyType', 'familyValues', 'videoUrl', 'isPremium', 'trustScore',
      'dob', 'height'
    ];

    const profileData = {};
    allowedFields.forEach(field => {
      const val = rawData[field];
      if (val !== undefined) {
        // Handle Required vs Optional fields
        if (val === '') {
          if (['name', 'gender'].includes(field)) {
            profileData[field] = val; // Keep required as strings
          } else if (field === 'isPremium' || field === 'isVerified') {
            profileData[field] = false;
          } else if (field === 'trustScore' || field === 'age' || field === 'height') {
            profileData[field] = 0;
          } else {
            profileData[field] = null; // Convert to null for optional fields
          }
        } else if (['trustScore', 'age', 'height'].includes(field)) {
          const parsed = parseInt(val, 10);
          profileData[field] = isNaN(parsed) ? (field === 'trustScore' ? 0 : null) : parsed;
        } else if (field === 'isPremium' || field === 'isVerified') {
          profileData[field] = String(val).toLowerCase() === 'true' || val === true;
        } else {
          profileData[field] = val;
        }
      }
    });

    // Special handling for photos (SQLite doesn't support arrays)
    if (rawData.photos) {
      if (Array.isArray(rawData.photos)) {
        profileData.photos = rawData.photos.join(',');
      } else if (typeof rawData.photos === 'string') {
        profileData.photos = rawData.photos;
      }
    }

    // Auto-calculate Age from DOB securely (overwrites age if provided)
    if (profileData.dob) {
      const birthDate = new Date(profileData.dob);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        profileData.age = calculatedAge;
        profileData.dob = birthDate; // Date object for Prisma
      } else {
        delete profileData.dob;
      }
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        ...profileData,
      },
      create: {
        ...profileData,
        userId,
      },
    });

    res.json({ message: 'Profile saved successfully', profile });
  } catch (error) {
    console.error('Save Profile Error:', error);
    res.status(500).json({ error: 'Failed to save profile: ' + (error.message || 'Unknown error') });
  }
};

exports.publicSearch = async (req, res) => {
  try {
    const { gender, ageFrom, ageTo, religion } = req.query;
    
    const filters = {
      status: 'ACTIVE',
      isVerified: true
    };

    if (gender) filters.profile = { gender };
    if (ageFrom || ageTo) {
      filters.profile = { 
        ...filters.profile,
        age: {
          gte: parseInt(ageFrom) || 18,
          lte: parseInt(ageTo) || 70
        }
      };
    }
    if (religion && religion !== 'All') {
      filters.profile = {
        ...filters.profile,
        religion
      };
    }

    const matches = await prisma.user.findMany({
      where: filters,
      include: {
        profile: true
      },
      take: 20 // Limit for guests
    });

    const publicResults = matches.map(user => {
      const p = user.profile;
      if (!p) return null;
      return {
        id: user.id,
        name: p.name.split(' ')[0], // Only first name for guests
        age: p.age,
        gender: p.gender,
        job: p.job,
        city: p.city,
        religion: p.religion,
        photo: p.photos ? p.photos.split(',')[0] : null
      };
    }).filter(m => m !== null);

    res.json(publicResults);
  } catch (error) {
    console.error('Public Search Error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};
