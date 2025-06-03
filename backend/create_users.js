// Connection à MongoDB
conn = new Mongo("mongodb://127.0.0.1:27017");
db = conn.getDB("tthdb");

// Liste des utilisateurs à créer
const users = [
    {
        username: "thomas.martin",
        firstName: "Thomas",
        lastName: "Martin",
        email: "thomas.martin@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi", // qwertyuiop
        profilePicture: "frontend/public/publication/_ (1).jpeg",
        phone: "+33612345678",
        residence: "Paris",
        birthdate: new Date("1990-05-15"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "sophie.dubois",
        firstName: "Sophie",
        lastName: "Dubois",
        email: "sophie.dubois@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/2?v=4",
        phone: "+33623456789",
        residence: "Lyon",
        birthdate: new Date("1992-08-21"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "marc.leroy",
        firstName: "Marc",
        lastName: "Leroy",
        email: "marc.leroy@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/3?v=4",
        phone: "+33634567890",
        residence: "Marseille",
        birthdate: new Date("1988-12-03"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "julie.petit",
        firstName: "Julie",
        lastName: "Petit",
        email: "julie.petit@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/4?v=4",
        phone: "+33645678901",
        residence: "Bordeaux",
        birthdate: new Date("1995-03-27"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "nicolas.bernard",
        firstName: "Nicolas",
        lastName: "Bernard",
        email: "nicolas.bernard@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/5?v=4",
        phone: "+33656789012",
        residence: "Toulouse",
        birthdate: new Date("1991-07-14"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "claire.moreau",
        firstName: "Claire",
        lastName: "Moreau",
        email: "claire.moreau@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/6?v=4",
        phone: "+33667890123",
        residence: "Nantes",
        birthdate: new Date("1993-11-30"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "antoine.roux",
        firstName: "Antoine",
        lastName: "Roux",
        email: "antoine.roux@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/7?v=4",
        phone: "+33678901234",
        residence: "Lille",
        birthdate: new Date("1987-09-08"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "marie.laurent",
        firstName: "Marie",
        lastName: "Laurent",
        email: "marie.laurent@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/8?v=4",
        phone: "+33689012345",
        residence: "Strasbourg",
        birthdate: new Date("1994-04-19"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "pierre.michel",
        firstName: "Pierre",
        lastName: "Michel",
        email: "pierre.michel@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/9?v=4",
        phone: "+33690123456",
        residence: "Rennes",
        birthdate: new Date("1989-01-25"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "emma.garcia",
        firstName: "Emma",
        lastName: "Garcia",
        email: "emma.garcia@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/10?v=4",
        phone: "+33601234567",
        residence: "Montpellier",
        birthdate: new Date("1996-06-11"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "lucas.simon",
        firstName: "Lucas",
        lastName: "Simon",
        email: "lucas.simon@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/11?v=4",
        phone: "+33612345678",
        residence: "Nice",
        birthdate: new Date("1992-10-05"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "lea.robert",
        firstName: "Léa",
        lastName: "Robert",
        email: "lea.robert@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/12?v=4",
        phone: "+33623456789",
        residence: "Grenoble",
        birthdate: new Date("1993-12-15"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "hugo.durand",
        firstName: "Hugo",
        lastName: "Durand",
        email: "hugo.durand@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/13?v=4",
        phone: "+33634567890",
        residence: "Dijon",
        birthdate: new Date("1990-08-30"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "camille.lemaire",
        firstName: "Camille",
        lastName: "Lemaire",
        email: "camille.lemaire@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/14?v=4",
        phone: "+33645678901",
        residence: "Tours",
        birthdate: new Date("1991-02-22"),
        isRegistrationComplete: true,
        createdAt: new Date()
    },
    {
        username: "maxime.blanc",
        firstName: "Maxime",
        lastName: "Blanc",
        email: "maxime.blanc@email.com",
        passwordHash: "$2a$11$PgQZrQlzLBLpMvNfGTBOOeDROWEetGBvyGI0DoKTk1cdRr8QWn/Fi",
        profilePicture: "https://avatars.githubusercontent.com/u/15?v=4",
        phone: "+33656789012",
        residence: "Angers",
        birthdate: new Date("1994-07-09"),
        isRegistrationComplete: true,
        createdAt: new Date()
    }
];

// Supprime tous les utilisateurs existants
db.users.deleteMany({});

// Insère les nouveaux utilisateurs
users.forEach(user => {
    db.users.insertOne(user);
});

print("15 utilisateurs ont été créés avec succès !");
