const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.sendInterest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot send interest to yourself' });
    }

    // Check if interest already exists
    const existing = await prisma.interest.findFirst({
      where: { senderId, receiverId }
    });

    if (existing) {
      return res.status(400).json({ error: 'Interest already sent' });
    }

    const interest = await prisma.interest.create({
      data: { senderId, receiverId }
    });

    res.status(201).json({ message: 'Interest sent successfully', interest });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send interest' });
  }
};

exports.getMyInterests = async (req, res) => {
  try {
    const userId = req.user.id;
    const interests = await prisma.interest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: { sender: { include: { profile: true } } }
    });
    res.json(interests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
};

exports.handleInterest = async (req, res) => {
  try {
    const { interestId, status } = req.body; // 'ACCEPTED' or 'DECLINED'
    const userId = req.user.id;

    const interest = await prisma.interest.findUnique({
      where: { id: interestId }
    });

    if (!interest || interest.receiverId !== userId) {
      return res.status(404).json({ error: 'Interest not found' });
    }

    const updatedInterest = await prisma.interest.update({
      where: { id: interestId },
      data: { status }
    });

    if (status === 'ACCEPTED') {
      // Create a Match automatically
      const user1Id = interest.senderId < interest.receiverId ? interest.senderId : interest.receiverId;
      const user2Id = interest.senderId < interest.receiverId ? interest.receiverId : interest.senderId;

      await prisma.match.upsert({
        where: { user1Id_user2Id: { user1Id, user2Id } },
        update: { status: 'ACTIVE' },
        create: { user1Id, user2Id, status: 'ACTIVE' }
      });
    }

    res.json({ message: `Interest ${status.toLowerCase()} successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process interest' });
  }
};

exports.getMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: 'ACTIVE'
      },
      include: {
        user1: { include: { profile: true } },
        user2: { include: { profile: true } }
      }
    });
    
    // Map to return the OTHER user's profile
    const partnerProfiles = matches.map(match => {
      const partner = match.user1Id === userId ? match.user2 : match.user1;
      return {
        matchId: match.id,
        id: partner.id,
        name: partner.profile?.name,
        age: partner.profile?.age,
        city: partner.profile?.city,
        photo: partner.profile?.photos ? partner.profile.photos.split(',')[0] : null
      };
    });

    res.json(partnerProfiles);
  } catch (error) {
    console.error('Fetch Matches Error:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};
