const barri = require(path.join(__dirname, "..", "repositories", "barri"));
// [barri] --> array amb els noms del barris per posar al desplegable

async function barriDesplegable ( ) {
    try {
    const [barris] = await barri.getAllNom();

        return barris;

    } catch (err) {
        console.error("no hem obtingut llista de barris [[ ", err, " ]]" )
    };
}; 

// devuelve array de barris,
//  barris[0].idBarri és el id del primer barri 
//  barris[0].Nom es el nom del primer barri

