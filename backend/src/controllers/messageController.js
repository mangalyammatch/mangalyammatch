const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { matchId, content } = req.body;

    // Verify user is part of the match
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });

    if (!match || (match.user1Id !== senderId && match.user2Id !== senderId)) {
      return res.status(403).json({ error: 'You are not part of this match' });
    }

    const message = await prisma.message.create({
      data: {
        matchId,
        senderId,
        content
      }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { matchId } = req.params;

    // Verify user is part of the match
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });

    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
      return res.status(403).json({ error: 'Unauthorized access to chat' });
    }

    const messages = await prisma.message.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all active matches for this user
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: 'ACTIVE'
      },
      include: {
        user1: { include: { profile: true } },
        user2: { include: { profile: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    const conversations = matches.map(match => {
      const partner = match.user1Id === userId ? match.user2 : match.user1;
      const lastMessage = match.messages[0];

      return {
        matchId: match.id,
        partner: {
          id: partner.id,
          name: partner.profile?.name || 'User',
          photo: partner.profile?.photos ? partner.profile.photos.split(',')[0] : null
        },
        lastMessage: lastMessage ? lastMessage.content : 'No messages yet',
        timestamp: lastMessage ? lastMessage.createdAt : match.updatedAt
      };
    });

    // Sort by most recent message
    conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(conversations);
  } catch (error) {
    console.error('Fetch Conversations Error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};
