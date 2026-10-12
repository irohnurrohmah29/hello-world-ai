const product = {
  name: "Iqlifar Store Parfum",
  brand: "Iqlifar Store Parfum",
  category: "fragrance",
  description: "Koleksi parfum dengan dua karakter aroma.",
  price: { amount: 99000, currency: "IDR" },
  images: [
    { url: null, alt: "Mockup konsep botol parfum Iqlifar; foto aktual belum tersedia", isPrimary: true }
  ],
  variants: [
    {
      id: "iqlima-50",
      name: "Iqlima",
      attributes: { sizeMl: 50 },
      description: "Wewangian untuk perempuan anggun dan elegan. Bukaan segar yang ceria bertemu floral romantis, lalu menetap dalam sentuhan creamy yang hangat.",
      notes: {
        top: ["Bergamot", "Pear", "Saffron", "Mandarin orange"],
        heart: ["Damask rose", "Jasmine sambac", "Iris", "Peony"],
        base: ["Vanilla Madagaskar", "White musk", "Amber", "Sandalwood"]
      },
      stock: 10
    },
    {
      id: "iqlima-100",
      name: "Iqlima",
      attributes: { sizeMl: 100 },
      description: "Wewangian untuk perempuan anggun dan elegan. Bukaan segar yang ceria bertemu floral romantis, lalu menetap dalam sentuhan creamy yang hangat.",
      notes: {
        top: ["Bergamot", "Pear", "Saffron", "Mandarin orange"],
        heart: ["Damask rose", "Jasmine sambac", "Iris", "Peony"],
        base: ["Vanilla Madagaskar", "White musk", "Amber", "Sandalwood"]
      },
      stock: 10
    },
    {
      id: "fariz-50",
      name: "Fariz",
      attributes: { sizeMl: 50 },
      description: "Wewangian lelaki dengan kesan awal yang tegas dan segar. Lavender dan leather membangun karakter berwibawa, ditutup dasar smoky yang earthy.",
      notes: {
        top: ["Grapefruit", "Pink pepper", "Calabrian bergamot", "Cardamom"],
        heart: ["Lavender", "Leather", "Cedarwood", "Geranium"],
        base: ["Oud", "Vetiver", "Ambergris", "Patchouli"]
      },
      stock: 10
    },
    {
      id: "fariz-100",
      name: "Fariz",
      attributes: { sizeMl: 100 },
      description: "Wewangian lelaki dengan kesan awal yang tegas dan segar. Lavender dan leather membangun karakter berwibawa, ditutup dasar smoky yang earthy.",
      notes: {
        top: ["Grapefruit", "Pink pepper", "Calabrian bergamot", "Cardamom"],
        heart: ["Lavender", "Leather", "Cedarwood", "Geranium"],
        base: ["Oud", "Vetiver", "Ambergris", "Patchouli"]
      },
      stock: 10
    }
  ]
};

module.exports = { product, slug: "iqlifar" };
