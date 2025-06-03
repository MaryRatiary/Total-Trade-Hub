// Connection à MongoDB
conn = new Mongo("mongodb://localhost:27017");
db = conn.getDB("tthdb");

// Mettre à jour tous les documents qui ont un username null
db.users.updateMany(
    { username: null },
    { $set: { username: "" } }
);

// Supprimer l'index username_1 s'il existe
try {
    db.users.dropIndex("username_1");
} catch (e) {
    print("Index username_1 n'existe pas ou a déjà été supprimé");
}

print("Migration terminée avec succès");
