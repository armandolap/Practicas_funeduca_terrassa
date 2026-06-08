-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `mydb` ;

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`Usuario_APP`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Usuario_APP` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Usuario_APP` (
  `idUsuario_APP` INT NOT NULL AUTO_INCREMENT,
  `Rol_usuario` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idUsuario_APP`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Direccio`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Direccio` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Direccio` (
  `idDireccio` INT NOT NULL AUTO_INCREMENT,
  `Calle` VARCHAR(45) NOT NULL,
  `Nom_calle` VARCHAR(45) NOT NULL,
  `Numero` INT NOT NULL,
  `Piso` VARCHAR(45) NULL,
  PRIMARY KEY (`idDireccio`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Centre_coordinacio`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Centre_coordinacio` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Centre_coordinacio` (
  `idCentre_coord` INT NOT NULL AUTO_INCREMENT,
  `Nom_centre_coord` VARCHAR(45) NOT NULL,
  `idDireccio` INT NOT NULL,
  PRIMARY KEY (`idCentre_coord`, `idDireccio`),
  CONSTRAINT `fk_Centros_coordinacion_Direcciones1`
    FOREIGN KEY (`idDireccio`)
    REFERENCES `mydb`.`Direccio` (`idDireccio`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_Centros_coordinacion_Direcciones1_idx` ON `mydb`.`Centre_coordinacio` (`idDireccio` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `mydb`.`Proyectos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Proyectos` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Proyectos` (
  `idProyecto` INT NOT NULL AUTO_INCREMENT,
  `Nom_projecte` VARCHAR(45) NOT NULL,
  'Descripcio' VARCHAR(512) ,
  -- 'responsable' <--- foreign key usuario?
  -- 'centro_coord' <--- foreign key ? falta tabla centros de coord?
  -- 'fecha_inicio' <-- inicio proyecto, no actividad
  -- 'fecha_fin' <-- fin proyecto, no actividad
  -- 'ubicación'
  -- 'plazas'
  -- 'inscritos'
  -- 'fecha_inicio_act'
  -- 'fecha_fin_act'
  `Centre_coordinacio` INT NOT NULL,
  PRIMARY KEY (`idProyecto`, `Centre_coordinacio`),
  CONSTRAINT `fk_Proyectos_Centros_coordinacion1`
    FOREIGN KEY (`Centre_coordinacio`)
    REFERENCES `mydb`.`Centre_coordinacio` (`idCentre_coord`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;




CREATE INDEX `fk_Proyectos_Centros_coordinacion1_idx` ON `mydb`.`Proyectos` (`Centre_coordinacio` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `mydb`.`Tipus_domicili`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Tipus_domicili` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Tipus_domicili` (
  `idTipus_domicili` INT NOT NULL AUTO_INCREMENT,
  `Nom_domicili` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idTipus_domicili`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Domicili`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Domicili` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Domicili` (
  `idDomicili` INT NOT NULL AUTO_INCREMENT,
  `Tipus_domicili` INT NOT NULL,
  `Direccio` INT NOT NULL,
  PRIMARY KEY (`idDomicili`, `Tipus_domicili`, `Direccio`),
  CONSTRAINT `fk_Domicilio_Tipo_domicilio`
    FOREIGN KEY (`Tipus_domicili`)
    REFERENCES `mydb`.`Tipus_domicili` (`idTipus_domicili`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Domicilio_Direcciones1`
    FOREIGN KEY (`Direccio`)
    REFERENCES `mydb`.`Direccio` (`idDireccio`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_Domicilio_Tipo_domicilio_idx` ON `mydb`.`Domicili` (`Tipus_domicili` ASC) VISIBLE;

CREATE INDEX `fk_Domicilio_Direcciones1_idx` ON `mydb`.`Domicili` (`Direccio` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `mydb`.`Proyectos_has_Usuarios APP`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Proyectos_has_Usuarios APP` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Proyectos_has_Usuarios APP` (
  `idProyecto` INT NOT NULL,
  `idUsuario_APP` INT NOT NULL,
  CONSTRAINT `fk_Proyectos_has_Usuarios APP_Proyectos1`
    FOREIGN KEY (`idProyecto`)
    REFERENCES `mydb`.`Proyectos` (`idProyecto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Proyectos_has_Usuarios APP_Usuarios APP1`
    FOREIGN KEY (`idUsuario_APP`)
    REFERENCES `mydb`.`Usuario_APP` (`idUsuario_APP`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_Proyectos_has_Usuarios APP_Usuarios APP1_idx` ON `mydb`.`Proyectos_has_Usuarios APP` (`idUsuario_APP` ASC) VISIBLE;

CREATE INDEX `fk_Proyectos_has_Usuarios APP_Proyectos1_idx` ON `mydb`.`Proyectos_has_Usuarios APP` (`idProyecto` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `mydb`.`Estructura_familiar`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Estructura_familiar` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Estructura_familiar` (
  `idEstructura_familiar` INT NOT NULL AUTO_INCREMENT,
  `Nom_est_fam` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idEstructura_familiar`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Familia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Familia` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Familia` (
  `idFamilia` INT NOT NULL AUTO_INCREMENT,
  `Cognom_familiar` VARCHAR(45) NOT NULL,
  `idDomicili` INT NOT NULL,
  `Estructura_familiar` INT NOT NULL,
  PRIMARY KEY (`idFamilia`, `idDomicili`, `Estructura_familiar`),
  CONSTRAINT `fk_Familias_Domicilio1`
    FOREIGN KEY (`idDomicili`)
    REFERENCES `mydb`.`Domicili` (`idDomicili`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Familias_Estructura_familiar1`
    FOREIGN KEY (`Estructura_familiar`)
    REFERENCES `mydb`.`Estructura_familiar` (`idEstructura_familiar`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_Familias_Domicilio1_idx` ON `mydb`.`Familia` (`idDomicili` ASC) VISIBLE;

CREATE INDEX `fk_Familias_Estructura_familiar1_idx` ON `mydb`.`Familia` (`Estructura_familiar` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `mydb`.`Pais`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Pais` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Pais` (
  `idPais` INT NOT NULL AUTO_INCREMENT,
  `Nom_pais` VARCHAR(120) NOT NULL,
  PRIMARY KEY (`idPais`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Rol`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Rol` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Rol` (
  `idRol` INT NOT NULL AUTO_INCREMENT,
  `Nom_rol` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idRol`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Risc`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Risc` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Risc` (
  `idRisc` INT NOT NULL AUTO_INCREMENT,
  `Nivel` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idRisc`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Resultat_academic`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Resultat_academic` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Resultat_academic` (
  `idResultat_academic` INT NOT NULL AUTO_INCREMENT,
  `Nom_resultat_acad` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idResultat_academic`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Motiu_baixa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Motiu_baixa` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Motiu_baixa` (
  `idMotiu_baixa` INT NOT NULL AUTO_INCREMENT,
  `Nom_motiu_baixa` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idMotiu_baixa`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Situacio_economica`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Situacio_economica` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Situacio_economica` (
  `idSituacio_economica` INT NOT NULL AUTO_INCREMENT,
  `Nom` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idSituacio_economica`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Sebas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Sebas` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Sebas` (
  `idSebas` INT NOT NULL AUTO_INCREMENT,
  `Nom` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idSebas`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Curs_actual`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Curs_actual` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Curs_actual` (
  `idCurs_actual` INT NOT NULL AUTO_INCREMENT,
  `Nom` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idCurs_actual`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Genere`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Genere` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Genere` (
  `idGenere` INT NOT NULL AUTO_INCREMENT,
  `Nom_genere` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idGenere`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Client`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Client` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Client` (
  `idClient` INT NOT NULL AUTO_INCREMENT,
  `idFamilia` INT NOT NULL,
  `idRol` INT NOT NULL,
  `idGenere` INT NOT NULL,
  `Nom` VARCHAR(45) NOT NULL,
  `Cognoms` VARCHAR(60) NOT NULL,
  `Telefon` VARCHAR(45) NULL,
  `Correu_electronic` VARCHAR(45) NULL,
  `Data_d_alta` DATE NOT NULL,
  `C_temps_a_lentitat` VARCHAR(45) NOT NULL,
  `Fecha_nacimiento` DATE NOT NULL,
  `C_edad` INT NOT NULL,
  `Data_baixa` DATE NULL,
  `Pais_naixement` INT NOT NULL,
  `Risc` INT NOT NULL,
  `Resultat_academic` INT NOT NULL,
  `Motiu_baixa` INT NULL,
  `idSituacio_economica` INT NOT NULL,
  `idSebas` INT NOT NULL,
  `derivacio_serveis_socials` TINYINT NOT NULL,
  `Curs_actual` INT NULL,
  PRIMARY KEY (`idClient`, `idFamilia`, `idRol`, `idGenere`, `Pais_naixement`, `Risc`, `idSituacio_economica`, `idSebas`),
  CONSTRAINT `fk_Usuarios_Familias1`
    FOREIGN KEY (`idFamilia`)
    REFERENCES `mydb`.`Familia` (`idFamilia`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuarios_Paisos_nacionalitat1`
    FOREIGN KEY (`Pais_naixement`)
    REFERENCES `mydb`.`Pais` (`idPais`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuarios_Rols1`
    FOREIGN KEY (`idRol`)
    REFERENCES `mydb`.`Rol` (`idRol`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuarios_Risc1`
    FOREIGN KEY (`Risc`)
    REFERENCES `mydb`.`Risc` (`idRisc`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuarios_Resultats_academics1`
    FOREIGN KEY (`Resultat_academic`)
    REFERENCES `mydb`.`Resultat_academic` (`idResultat_academic`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuarios_Motiux_baixa1`
    FOREIGN KEY (`Motiu_baixa`)
    REFERENCES `mydb`.`Motiu_baixa` (`idMotiu_baixa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuarios_Situacio_laboral1`
    FOREIGN KEY (`idSituacio_economica`)
    REFERENCES `mydb`.`Situacio_economica` (`idSituacio_economica`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuarios_Sebas1`
    FOREIGN KEY (`idSebas`)
    REFERENCES `mydb`.`Sebas` (`idSebas`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuarios_Curs_actual2`
    FOREIGN KEY (`Curs_actual`)
    REFERENCES `mydb`.`Curs_actual` (`idCurs_actual`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Client_Genere1`
    FOREIGN KEY (`idGenere`)
    REFERENCES `mydb`.`Genere` (`idGenere`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_Usuarios_Familias1_idx` ON `mydb`.`Client` (`idFamilia` ASC) VISIBLE;

CREATE INDEX `fk_Usuarios_Paisos_nacionalitat1_idx` ON `mydb`.`Client` (`Pais_naixement` ASC) VISIBLE;

CREATE INDEX `fk_Usuarios_Rols1_idx` ON `mydb`.`Client` (`idRol` ASC) VISIBLE;

CREATE INDEX `fk_Usuarios_Risc1_idx` ON `mydb`.`Client` (`Risc` ASC) VISIBLE;

CREATE INDEX `fk_Usuarios_Resultats_academics1_idx` ON `mydb`.`Client` (`Resultat_academic` ASC) VISIBLE;

CREATE INDEX `fk_Usuarios_Motiux_baixa1_idx` ON `mydb`.`Client` (`Motiu_baixa` ASC) VISIBLE;

CREATE INDEX `fk_Usuarios_Situacio_laboral1_idx` ON `mydb`.`Client` (`idSituacio_economica` ASC) VISIBLE;

CREATE INDEX `fk_Usuarios_Sebas1_idx` ON `mydb`.`Client` (`idSebas` ASC) VISIBLE;

CREATE INDEX `fk_Usuarios_Curs_actual2_idx` ON `mydb`.`Client` (`Curs_actual` ASC) VISIBLE;

CREATE INDEX `fk_Client_Genere1_idx` ON `mydb`.`Client` (`idGenere` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `mydb`.`Client_has_Domicili`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Client_has_Domicili` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Client_has_Domicili` (
  `idClient` INT NOT NULL,
  `idDomicili` INT NOT NULL,
  CONSTRAINT `fk_Usuarios_has_Domicilio_Usuarios1`
    FOREIGN KEY (`idClient`)
    REFERENCES `mydb`.`Client` (`idClient`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuarios_has_Domicilio_Domicilio1`
    FOREIGN KEY (`idDomicili`)
    REFERENCES `mydb`.`Domicili` (`idDomicili`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_Usuarios_has_Domicilio_Domicilio1_idx` ON `mydb`.`Client_has_Domicili` (`idDomicili` ASC) VISIBLE;

CREATE INDEX `fk_Usuarios_has_Domicilio_Usuarios1_idx` ON `mydb`.`Client_has_Domicili` (`idClient` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `mydb`.`Nacionalitat`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Nacionalitat` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Nacionalitat` (
  `idPais` INT NOT NULL,
  `idClient` INT NOT NULL,
  PRIMARY KEY (`idPais`, `idClient`),
  CONSTRAINT `fk_Paisos_nacionalitat_has_Usuarios_Paisos_nacionalitat1`
    FOREIGN KEY (`idPais`)
    REFERENCES `mydb`.`Pais` (`idPais`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Paisos_nacionalitat_has_Usuarios_Usuarios1`
    FOREIGN KEY (`idClient`)
    REFERENCES `mydb`.`Client` (`idClient`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_Paisos_nacionalitat_has_Usuarios_Usuarios1_idx` ON `mydb`.`Nacionalitat` (`idClient` ASC) VISIBLE;

CREATE INDEX `fk_Paisos_nacionalitat_has_Usuarios_Paisos_nacionalitat1_idx` ON `mydb`.`Nacionalitat` (`idPais` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `mydb`.`Necessitats_especials`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Necessitats_especials` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Necessitats_especials` (
  `idNecessitat_especial` INT NOT NULL AUTO_INCREMENT,
  `Nom_necessitat` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idNecessitat_especial`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Necessitats_especials_has_Client`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Necessitats_especials_has_Client` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Necessitats_especials_has_Client` (
  `idNecessitat_especial` INT NOT NULL,
  `idClient` INT NOT NULL,
  PRIMARY KEY (`idNecessitat_especial`, `idClient`),
  CONSTRAINT `fk_Necessitats_especials_has_Usuarios_Necessitats_especials1`
    FOREIGN KEY (`idNecessitat_especial`)
    REFERENCES `mydb`.`Necessitats_especials` (`idNecessitat_especial`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Necessitats_especials_has_Usuarios_Usuarios1`
    FOREIGN KEY (`idClient`)
    REFERENCES `mydb`.`Client` (`idClient`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_Necessitats_especials_has_Usuarios_Usuarios1_idx` ON `mydb`.`Necessitats_especials_has_Client` (`idClient` ASC) VISIBLE;

CREATE INDEX `fk_Necessitats_especials_has_Usuarios_Necessitats_especials_idx` ON `mydb`.`Necessitats_especials_has_Client` (`idNecessitat_especial` ASC) VISIBLE;


-- -----------------------------------------------------
-- Table `mydb`.`Persona_relacionada`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Persona_relacionada` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Persona_relacionada` (
  `Client_idClient` INT NOT NULL,
  `Client_idClient1` INT NOT NULL,
  CONSTRAINT `fk_Client_has_Client_Client1`
    FOREIGN KEY (`Client_idClient`)
    REFERENCES `mydb`.`Client` (`idClient`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Client_has_Client_Client2`
    FOREIGN KEY (`Client_idClient1`)
    REFERENCES `mydb`.`Client` (`idClient`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_Client_has_Client_Client2_idx` ON `mydb`.`Persona_relacionada` (`Client_idClient1` ASC) VISIBLE;

CREATE INDEX `fk_Client_has_Client_Client1_idx` ON `mydb`.`Persona_relacionada` (`Client_idClient` ASC) VISIBLE;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
