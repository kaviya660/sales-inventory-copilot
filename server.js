const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// PRODUCT DATA
// ===============================

const products = [
  {
    id: 1,
    name: "Wireless Mouse",
    stock: 15,
    dailySales: 5,
    price: 599
  },
  {
    id: 2,
    name: "Keyboard",
    stock: 80,
    dailySales: 3,
    price: 999
  },
  {
    id: 3,
    name: "USB Cable",
    stock: 8,
    dailySales: 4,
    price: 299
  },
  {
    id: 4,
    name: "Headphones",
    stock: 120,
    dailySales: 2,
    price: 1499
  },
  {
    id: 5,
    name: "Power Bank",
    stock: 12,
    dailySales: 6,
    price: 1299
  }
];

// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Sales & Inventory Copilot is running!"
  });
});

// ===============================
// GET ALL PRODUCTS
// ===============================

app.get("/api/products", (req, res) => {
  res.json(products);
});

// ===============================
// LOW STOCK
// ===============================

app.get("/api/low-stock", (req, res) => {
  const lowStock = products.filter((product) => {
    if (product.dailySales <= 0) return false;

    return product.stock / product.dailySales <= 3;
  });

  res.json(lowStock);
});

// ===============================
// OVERSTOCK
// ===============================

app.get("/api/overstock", (req, res) => {
  const overstock = products.filter((product) => {
    if (product.dailySales <= 0) return false;

    return product.stock / product.dailySales >= 30;
  });

  res.json(overstock);
});

// ===============================
// AI COPILOT
// ===============================

app.post("/api/ai", (req, res) => {
  const question = (req.body.question || "").toLowerCase().trim();

  const lowStock = products.filter((product) => {
    if (product.dailySales <= 0) return false;

    return product.stock / product.dailySales <= 3;
  });

  const overstock = products.filter((product) => {
    if (product.dailySales <= 0) return false;

    return product.stock / product.dailySales >= 30;
  });

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  let answer = "";

  // -------------------------------
  // REORDER QUESTIONS
  // -------------------------------

  if (
    question.includes("reorder") ||
    question.includes("re-order") ||
    question.includes("buy") ||
    question.includes("purchase") ||
    question.includes("low stock")
  ) {
    if (lowStock.length === 0) {
      answer = "✅ No products need reordering right now.";
    } else {
      const names = lowStock
        .map((product) => {
          const days = (
            product.stock / product.dailySales
          ).toFixed(1);

          return `${product.name} (${product.stock} units, ${days} days remaining)`;
        })
        .join(", ");

      answer =
        `⚠️ You should reorder: ${names}. ` +
        `These products may run out soon.`;
    }
  }

  // -------------------------------
  // OVERSTOCK QUESTIONS
  // -------------------------------

  else if (
    question.includes("overstock") ||
    question.includes("over stock") ||
    question.includes("excess")
  ) {
    if (overstock.length === 0) {
      answer = "✅ There are no overstocked products.";
    } else {
      const names = overstock
        .map(
          (product) =>
            `${product.name} (${product.stock} units)`
        )
        .join(", ");

      answer =
        `🚨 Overstocked product: ${names}. ` +
        `Consider reducing new purchases or offering a promotion.`;
    }
  }

  // -------------------------------
  // TOTAL STOCK QUESTIONS
  // -------------------------------

  else if (
    question.includes("total stock") ||
    question.includes("how much stock") ||
    question.includes("inventory")
  ) {
    answer =
      `📦 You currently have ${products.length} products ` +
      `with a total stock of ${totalStock} units. ` +
      `${lowStock.length} products need reordering and ` +
      `${overstock.length} product is overstocked.`;
  }

  // -------------------------------
  // PRODUCT QUESTIONS
  // -------------------------------

  else {
    const matchedProduct = products.find((product) =>
      question.includes(product.name.toLowerCase())
    );

    if (matchedProduct) {
      const days =
        matchedProduct.dailySales > 0
          ? matchedProduct.stock / matchedProduct.dailySales
          : 0;

      answer =
        `📦 ${matchedProduct.name}: ` +
        `Stock ${matchedProduct.stock} units, ` +
        `daily sales ${matchedProduct.dailySales} units, ` +
        `${days.toFixed(1)} days remaining.`;
    } else {
      answer =
        "🤖 I can help you with inventory, stock levels, " +
        "reorder recommendations, overstock and product information.";
    }
  }

  res.json({
    answer: answer
  });
});

// ===============================
// START SERVER
// ===============================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});