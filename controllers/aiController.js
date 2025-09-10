const { OpenAI } = require('openai');
const asyncHandler = require('express-async-handler');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate recipe from ingredients
const generateRecipe = asyncHandler(async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ message: 'Ingredients are required' });
  }

  const prompt = `Create a detailed recipe using the following ingredients: ${ingredients.join(', ')}. Include a title, a summary, ingredients list, and step-by-step instructions.`;

  const completion = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 700,
  });

  const recipeText = completion.data.choices[0].message.content;

  res.json({ recipe: recipeText });
});

// Auto-tagging for a recipe description
const autoTagRecipe = asyncHandler(async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ message: 'Description is required' });
  }

  const prompt = `Suggest relevant tags as comma-separated keywords for this recipe description: "${description}"`;

  const completion = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 60,
  });

  const tagsText = completion.data.choices[0].message.content;
  const tags = tagsText.split(/,|\n/).map(tag => tag.trim().toLowerCase()).filter(Boolean);

  res.json({ tags });
});

// Generate grocery list from favorite recipes
const generateGroceryList = asyncHandler(async (req, res) => {
  const { recipes } = req.body; // Expect array of recipe objects with ingredients arrays

  if (!recipes || !Array.isArray(recipes)) {
    return res.status(400).json({ message: 'Recipes array is required' });
  }

  const allIngredients = recipes.flatMap(r => r.ingredients || []);
  const uniqueIngredients = [...new Set(allIngredients)];

  const prompt = `Create a consolidated grocery shopping list from these ingredients:\n${uniqueIngredients.join(', ')}`;

  const completion = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 200,
  });

  const groceryList = completion.data.choices[0].message.content;

  res.json({ groceryList });
});

module.exports = {
  generateRecipe,
  autoTagRecipe,
  generateGroceryList,
};