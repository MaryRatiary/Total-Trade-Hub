// Connection à MongoDB
conn = new Mongo("mongodb://127.0.0.1:27017");
db = conn.getDB("tthdb");

// Liste des images disponibles pour les publications
const publicationImages = [
    "/publication/1905.i126.002.s.m005.c13.programmer design concept-04.jpg",
    "/publication/2149901763.jpg",
    "/publication/2149901780.jpg",
    "/publication/2150038862.jpg",
    "/publication/2150911983.jpg",
    "/publication/5274708.jpg",
    "/publication/5995357.jpg",
    "/publication/Bague Homme Obsidienne – Force de Nature, Argent Plaqué Or.jpeg",
    "/publication/Discover the Beauty of Amethyst_ A Gemstone Guide.jpeg",
    "/publication/NA_SEP._29.jpg",
    "/publication/_ (1).jpeg",
    "/publication/_ (2).jpeg",
    "/publication/_ (3).jpeg",
    "/publication/_ (4).jpeg",
    "/publication/_ (5).jpeg",
    "/publication/_ (6).jpeg",
    "/publication/_ (7).jpeg",
    "/publication/_.jpeg",
    "/publication/concept-de-resolution-de-problemes-avec-un-homme-travaillant.jpg",
    "/publication/des-pilules-pour-stimuler-le-cerveau.jpg",
    "/publication/le-directeur-surpris-regarde-l-horloge.jpg"
];

// Liste de titres possibles pour les publications
const titles = [
    "Magnifique paysage de montagne",
    "Design moderne et épuré",
    "Collection de bijoux unique",
    "Art contemporain à découvrir",
    "Innovation technologique",
    "Style urbain tendance",
    "Accessoires de luxe",
    "Photographie artistique",
    "Création originale",
    "Pièce de collection rare"
];

// Liste de descriptions possibles
const descriptions = [
    "Une pièce unique qui ne manquera pas de vous séduire",
    "Découvrez cette création exceptionnelle",
    "Un must-have pour les amateurs d'art",
    "Une occasion à ne pas manquer",
    "Parfait pour les collectionneurs",
    "Une création qui sort de l'ordinaire",
    "Un design qui fait la différence",
    "Une pièce qui a une histoire",
    "Un investissement pour l'avenir",
    "Une valeur sûre à posséder"
];

// Liste de villes françaises
const locations = ["Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse", "Nantes", "Strasbourg", "Lille", "Nice", "Rennes"];

// Fonction pour obtenir un élément aléatoire d'un tableau
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Fonction pour générer un prix aléatoire entre 10 et 1000
function getRandomPrice() {
    return Math.floor(Math.random() * 990) + 10;
}

// Fonction pour générer une date aléatoire dans les 30 derniers jours
function getRandomDate() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
}

// Récupère tous les utilisateurs
const users = db.users.find().toArray();

// Supprime toutes les publications existantes
db.articles.deleteMany({});

// Crée 20 publications aléatoires
for (let i = 0; i < 20; i++) {
    const article = {
        title: getRandomElement(titles),
        content: getRandomElement(publicationImages),
        price: getRandomPrice(),
        location: getRandomElement(locations),
        description: getRandomElement(descriptions),
        userId: getRandomElement(users)._id.toString(),
        createdAt: getRandomDate(),
        likes: [],
        comments: [],
        views: Math.floor(Math.random() * 100)
    };

    db.articles.insertOne(article);
}

print("20 publications ont été créées avec succès !");
