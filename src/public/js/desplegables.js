const barri = require(path.join(__dirname, "..", "repositories", "barri"));
// [barri] --> array amb els noms del barris per posar al desplegable

async function barriDesplegable ( ) {
    try {
    const barris = await barri.getAllNom();

        return barris;

    } catch (err) {
        console.error("no hem obtingut llista de barris [[ ", err, " ]]" )
    };
}; 

// devuelve array de barris,
//  barris[0].idBarri és el id del primer barri 
//  barris[0].Nom es el nom del primer barri



const codi_postal = require(path.join(__dirname, "..", "repositories", "codi_postal"));
// [barri] --> array amb els noms del barris per posar al desplegable

async function codiPostalDesplegable ( ) {
    try {
    const codis = await codi_postal.getAll();

        return codis;

    } catch (err) {
        console.error("no hem obtingut llista de codis Postals [[ ", err, " ]]" )
    };
}; 

// devuelve array de codis postals amb 
//  codis[0].idCodi_postal
//  codis[0].Codi


const curs = require(path.join(__dirname, "..", "repositories", "curso"));
// [barri] --> array amb els noms del barris per posar al desplegable

async function cursoDesplegable ( ) {
    try {
    const curso = await curs.getAll();

        return curso;

    } catch (err) {
        console.error("no hem obtingut llista de cursos [[ ", err, " ]]" )
    };
};

// CREATE TABLE IF NOT EXISTS `mydb`.`curs_actual` (
//   `idCurs_actual` INT NOT NULL AUTO_INCREMENT,
//   `Nom` VARCHAR(45) NOT NULL,

// curso[0].idCurs_actual  --> per asignar un ID al desplegable
// curso[0].Nom  --> per mostrar el nom del curs al desplegable

const estructFam = require(path.join(__dirname, "..", "repositories", "estructura_familiar"));

async function estructruraFamiliarDesplegable ( ) {
    try {
    const estFam = await estructFam.getAll();

        return estFam;

    } catch (err) {
        console.error("no hem obtingut llista de estructures familiars [[ ", err, " ]]" )
    };
};

// CREATE TABLE IF NOT EXISTS `mydb`.`estructura_familiar` (
//   `idEstructura_familiar` INT NOT NULL AUTO_INCREMENT,
//   `Nom_est_fam` VARCHAR(45) NOT NULL UNIQUE,


const motiuBaixa = require(path.join(__dirname, "..", "repositories", "motiu_baixa"));

async function motiuBaixaDesplegable ( ) {
    try {
    const motBaixa = await motiuBaixa.getAll();

        return motBaixa;

    } catch (err) {
        console.error("no hem obtingut llista de motius de baixa [[ ", err, " ]]" )
    };
};


// CREATE TABLE IF NOT EXISTS `mydb`.`motiu_baixa` (
//   `idMotiu_baixa` INT NOT NULL AUTO_INCREMENT,
//   `Nom_motiu_baixa` VARCHAR(45) NOT NULL UNIQUE,


module.exports = {
    codiPostalDesplegable ,
    barriDesplegable,
    cursoDesplegable,
    estructruraFamiliarDesplegable,
    motiuBaixaDesplegable,
    

}
