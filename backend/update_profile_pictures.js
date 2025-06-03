// Connection à MongoDB
conn = new Mongo("mongodb://127.0.0.1:27017");
db = conn.getDB("tthdb");

// Liste des photos de profil disponibles
const profilePictures = [
    "-(1).jpeg",
    "-(2).jpeg",
    "-(3).jpeg",
    "-(4).jpeg",
    "_(5).jpeg",
    "https://avatars.githubusercontent.com/u/2?v=4",
    "https://avatars.githubusercontent.com/u/3?v=4",
    "https://avatars.githubusercontent.com/u/4?v=4",
    "https://avatars.githubusercontent.com/u/5?v=4",
    "https://avatars.githubusercontent.com/u/6?v=4",
    "https://avatars.githubusercontent.com/u/7?v=4",
    "https://avatars.githubusercontent.com/u/8?v=4",
    "https://avatars.githubusercontent.com/u/9?v=4",
    "https://avatars.githubusercontent.com/u/10?v=4",
    "https://avatars.githubusercontent.com/u/11?v=4",
    "https://avatars.githubusercontent.com/u/12?v=4"
];

// Récupère tous les utilisateurs
const users = db.users.find().toArray();

// Met à jour chaque utilisateur avec une photo de profil aléatoire
users.forEach((user, index) => {
    // Utilise l'opérateur modulo pour s'assurer de ne pas dépasser le nombre de photos disponibles
    const pictureIndex = index % profilePictures.length;
    db.users.updateOne(
        { _id: user._id },
        { $set: { profilePicture: profilePictures[pictureIndex] } }
    );
});

print("Les photos de profil ont été mises à jour avec succès !");
