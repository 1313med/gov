const asyncHandler = require("express-async-handler");
const Question = require("../models/Question");

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base) {
  let slug = base;
  let i = 1;
  while (await Question.findOne({ slug })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

// GET /api/qa
exports.listQuestions = asyncHandler(async (req, res) => {
  const { brand, model, topic, limit = 20 } = req.query;
  const filter = { status: "published" };
  if (brand) filter.brand = brandFilter(brand);
  if (model) filter.model = modelFilter(model);
  if (topic) filter.topic = topic;

  const questions = await Question.find(filter)
    .populate("authorId", "name avatar")
    .populate("answers.authorId", "name avatar")
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 20, 50))
    .lean();

  res.json({ questions, total: questions.length });
});

function brandFilter(brand) {
  return new RegExp(`^${String(brand).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
}

function modelFilter(model) {
  return new RegExp(`^${String(model).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
}

// GET /api/qa/:slug
exports.getQuestion = asyncHandler(async (req, res) => {
  const q = await Question.findOneAndUpdate(
    { slug: req.params.slug, status: "published" },
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate("authorId", "name avatar")
    .populate("answers.authorId", "name avatar");

  if (!q) return res.status(404).json({ message: "Question not found" });
  res.json(q);
});

// POST /api/qa
exports.createQuestion = asyncHandler(async (req, res) => {
  const { question, body, brand, model, topic } = req.body;
  if (!question || question.length < 10) {
    return res.status(400).json({ message: "Question must be at least 10 characters" });
  }
  const base = slugify(question);
  const slug = await uniqueSlug(base);
  const q = await Question.create({
    slug,
    question,
    body: body || "",
    brand: brand || null,
    model: model || null,
    topic: topic || "general",
    authorId: req.user._id,
    status: "published",
  });
  res.status(201).json(q);
});

// POST /api/qa/:slug/answers
exports.addAnswer = asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!body || body.length < 5) {
    return res.status(400).json({ message: "Answer must be at least 5 characters" });
  }
  const q = await Question.findOne({ slug: req.params.slug, status: "published" });
  if (!q) return res.status(404).json({ message: "Question not found" });

  q.answers.push({ authorId: req.user._id, body });
  await q.save();
  await q.populate("answers.authorId", "name avatar");
  res.status(201).json(q);
});

// POST /api/qa/:slug/vote
exports.voteQuestion = asyncHandler(async (req, res) => {
  const q = await Question.findOne({ slug: req.params.slug, status: "published" });
  if (!q) return res.status(404).json({ message: "Question not found" });
  q.upvotes = (q.upvotes || 0) + 1;
  await q.save();
  res.json({ upvotes: q.upvotes });
});

// POST /api/qa/:slug/answers/:answerId/vote
exports.voteAnswer = asyncHandler(async (req, res) => {
  const { direction = "up" } = req.body;
  const q = await Question.findOne({ slug: req.params.slug, status: "published" });
  if (!q) return res.status(404).json({ message: "Question not found" });
  const answer = q.answers.id(req.params.answerId);
  if (!answer) return res.status(404).json({ message: "Answer not found" });
  if (direction === "down") answer.downvotes = (answer.downvotes || 0) + 1;
  else answer.upvotes = (answer.upvotes || 0) + 1;
  await q.save();
  res.json({ upvotes: answer.upvotes, downvotes: answer.downvotes });
});

// POST /api/qa/:slug/answers/:answerId/accept
exports.acceptAnswer = asyncHandler(async (req, res) => {
  const q = await Question.findOne({ slug: req.params.slug, status: "published" });
  if (!q) return res.status(404).json({ message: "Question not found" });
  if (String(q.authorId) !== String(req.user._id)) {
    return res.status(403).json({ message: "Only the question author can accept an answer" });
  }
  q.answers.forEach((a) => {
    a.accepted = String(a._id) === String(req.params.answerId);
  });
  await q.save();
  await q.populate("answers.authorId", "name avatar");
  res.json(q);
});
