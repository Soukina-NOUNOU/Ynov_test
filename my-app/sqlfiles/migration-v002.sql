USE ynov_ci;
CREATE TABLE utilisateur
(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    birth DATE NOT NULL,
    city VARCHAR(255) NOT NULL,
    postalCode VARCHAR(5) NOT NULL
);
DESCRIBE utilisateur;