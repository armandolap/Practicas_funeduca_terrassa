  -- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET GLOBAL event_scheduler = ON;
-- -----------------------------------------------------
-- Schema crm_funeduca
-- -----------------------------------------------------

  -- -----------------------------------------------------
  -- Schema crm_funeduca
  -- -----------------------------------------------------
  CREATE SCHEMA IF NOT EXISTS `crm_funeduca` DEFAULT CHARACTER SET utf8mb4 ;
  USE `crm_funeduca` ;

  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`barri`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`barri` (
    `idBarri` INT NOT NULL AUTO_INCREMENT,
    `Nom` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`idBarri`),
    UNIQUE INDEX `Nom_UNIQUE` (`Nom` ASC))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`codi_postal`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`codi_postal` (
    `idCodi_postal` INT NOT NULL AUTO_INCREMENT,
    `Codi` VARCHAR(10) NOT NULL,
    PRIMARY KEY (`idCodi_postal`),
    UNIQUE INDEX `Codi_UNIQUE` (`Codi` ASC))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`tipus_via`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`tipus_via` (
    `idTipus_via` INT NOT NULL AUTO_INCREMENT,
    `Nom` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`idTipus_via`),
    UNIQUE INDEX `Nom_UNIQUE` (`Nom` ASC))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`callejero`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`callejero` (
    `idcallejero` INT NOT NULL AUTO_INCREMENT,
    `idBarri` INT NOT NULL,
    `idTipus_via` INT NOT NULL,
    `idCodi_postal` INT NOT NULL,
    `Nom_calle` VARCHAR(45) NULL DEFAULT NULL,
    PRIMARY KEY (`idcallejero`),
    INDEX `fk_callejero_barri1_idx` (`idBarri` ASC),
    INDEX `fk_callejero_tipus_via1_idx` (`idTipus_via` ASC),
    INDEX `fk_callejero_codi_postal1_idx` (`idCodi_postal` ASC),
    CONSTRAINT `fk_callejero_barri1`
      FOREIGN KEY (`idBarri`)
      REFERENCES `crm_funeduca`.`barri` (`idBarri`),
    CONSTRAINT `fk_callejero_codi_postal1`
      FOREIGN KEY (`idCodi_postal`)
      REFERENCES `crm_funeduca`.`codi_postal` (`idCodi_postal`),
    CONSTRAINT `fk_callejero_tipus_via1`
      FOREIGN KEY (`idTipus_via`)
      REFERENCES `crm_funeduca`.`tipus_via` (`idTipus_via`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`direccio`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`direccio` (
    `idDireccio` INT NOT NULL AUTO_INCREMENT,
    `idcallejero` INT NOT NULL,
    `Num_calle` VARCHAR(45) NOT NULL,
    `Pis` VARCHAR(45) NULL DEFAULT NULL,
    `Escala` VARCHAR(45) NULL DEFAULT NULL,
    PRIMARY KEY (`idDireccio`),
    INDEX `fk_direccio_callejero1_idx` (`idcallejero` ASC),
    CONSTRAINT `fk_direccio_callejero1`
      FOREIGN KEY (`idcallejero`)
      REFERENCES `crm_funeduca`.`callejero` (`idcallejero`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`centre_activitats`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`centre_activitats` (
    `idcentre_activitats` INT NOT NULL AUTO_INCREMENT,
    `nom_centre_activitats` VARCHAR(45) NOT NULL,
    `direccio_idDireccio` INT NOT NULL,
    PRIMARY KEY (`idcentre_activitats`),
    INDEX `fk_centre_activitats_direccio1_idx` (`direccio_idDireccio` ASC),
    CONSTRAINT `fk_centre_activitats_direccio1`
      FOREIGN KEY (`direccio_idDireccio`)
      REFERENCES `crm_funeduca`.`direccio` (`idDireccio`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`tipus_domicili`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`tipus_domicili` (
    `idTipus_domicili` INT NOT NULL AUTO_INCREMENT,
    `Nom_domicili` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idTipus_domicili`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`domicili`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`domicili` (
    `idDomicili` INT NOT NULL AUTO_INCREMENT,
    `Tipus_domicili` INT NOT NULL,
    `Direccio` INT NOT NULL,
    PRIMARY KEY (`idDomicili`),
    INDEX `fk_Domicilio_Tipo_domicilio_idx` (`Tipus_domicili` ASC),
    INDEX `fk_Domicilio_Direcciones1_idx` (`Direccio` ASC),
    CONSTRAINT `fk_Domicilio_Direcciones1`
      FOREIGN KEY (`Direccio`)
      REFERENCES `crm_funeduca`.`direccio` (`idDireccio`),
    CONSTRAINT `fk_Domicilio_Tipo_domicilio`
      FOREIGN KEY (`Tipus_domicili`)
      REFERENCES `crm_funeduca`.`tipus_domicili` (`idTipus_domicili`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`genere`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`genere` (
    `idGenere` INT NOT NULL AUTO_INCREMENT,
    `Nom_genere` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idGenere`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`curs_actual`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`curs_actual` (
    `idCurs_actual` INT NOT NULL AUTO_INCREMENT,
    `Nom` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idCurs_actual`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`estructura_familiar`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`estructura_familiar` (
    `idEstructura_familiar` INT NOT NULL AUTO_INCREMENT,
    `Nom_est_fam` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idEstructura_familiar`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`familia`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`familia` (
    `idFamilia` INT NOT NULL AUTO_INCREMENT,
    `Cognom_familiar` VARCHAR(120) NOT NULL,
    `Estructura_familiar` INT NOT NULL,
    PRIMARY KEY (`idFamilia`),
    UNIQUE INDEX `Cognom_familiar_UNIQUE` (`Cognom_familiar` ASC),
    INDEX `fk_Familias_Estructura_familiar1_idx` (`Estructura_familiar` ASC),
    CONSTRAINT `fk_Familias_Estructura_familiar1`
      FOREIGN KEY (`Estructura_familiar`)
      REFERENCES `crm_funeduca`.`estructura_familiar` (`idEstructura_familiar`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`motiu_baixa`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`motiu_baixa` (
    `idMotiu_baixa` INT NOT NULL AUTO_INCREMENT,
    `Nom_motiu_baixa` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idMotiu_baixa`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`pais`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`pais` (
    `idPais` INT NOT NULL AUTO_INCREMENT,
    `Nom_pais` VARCHAR(120) NOT NULL,
    PRIMARY KEY (`idPais`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`resultat_academic`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`resultat_academic` (
    `idResultat_academic` INT NOT NULL AUTO_INCREMENT,
    `Nom_resultat_acad` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idResultat_academic`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`risc`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`risc` (
    `idRisc` INT NOT NULL AUTO_INCREMENT,
    `Nivel` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idRisc`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`rol`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`rol` (
    `idRol` INT NOT NULL AUTO_INCREMENT,
    `Nom_rol` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idRol`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`sebas`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`sebas` (
    `idSebas` INT NOT NULL AUTO_INCREMENT,
    `Nom` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idSebas`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`situacio_economica`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`situacio_economica` (
    `idSituacio_economica` INT NOT NULL AUTO_INCREMENT,
    `Nom` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idSituacio_economica`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`client`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`client` (
    `idClient` INT NOT NULL AUTO_INCREMENT,
    `idFamilia` INT NOT NULL,
    `idRol` INT NOT NULL,
    `idGenere` INT NOT NULL,
    `Nom` VARCHAR(45) NOT NULL,
    `Cognoms` VARCHAR(60) NOT NULL,
    `Telefon` VARCHAR(45) NULL DEFAULT NULL,
    `Correu_electronic` VARCHAR(45) NULL DEFAULT NULL,
    `Data_d_alta` DATE NOT NULL,
    `C_temps_a_lentitat` VARCHAR(45) NOT NULL,
    `Fecha_nacimiento` DATE NOT NULL,
    `C_edad` INT NOT NULL,
    `Pais_naixement` INT NOT NULL,
    `Risc` INT NOT NULL,
    `Resultat_academic` INT NULL,
    `idSituacio_economica` INT NOT NULL,
    `idSebas` INT NOT NULL,
    `idNecessitat_especial` INT NULL DEFAULT NULL,
    `derivacio_serveis_socials` TINYINT NOT NULL,
    `Curs_actual` INT NULL DEFAULT NULL,
    `idDomicili` INT NOT NULL,
    `Baixa` TINYINT NOT NULL,
    `Motiu_baixa` INT NULL DEFAULT NULL,
    `Data_baixa` DATE NULL DEFAULT NULL,
    PRIMARY KEY (`idClient`),
    INDEX `fk_Usuarios_Familias1_idx` (`idFamilia` ASC),
    INDEX `fk_Usuarios_Paisos_nacionalitat1_idx` (`Pais_naixement` ASC),
    INDEX `fk_Usuarios_Rols1_idx` (`idRol` ASC),
    INDEX `fk_Usuarios_Risc1_idx` (`Risc` ASC),
    INDEX `fk_Usuarios_Resultats_academics1_idx` (`Resultat_academic` ASC),
    INDEX `fk_Usuarios_Motiux_baixa1_idx` (`Motiu_baixa` ASC),
    INDEX `fk_Usuarios_Situacio_laboral1_idx` (`idSituacio_economica` ASC),
    INDEX `fk_Usuarios_Sebas1_idx` (`idSebas` ASC),
    INDEX `fk_Usuarios_Curs_actual2_idx` (`Curs_actual` ASC),
    INDEX `fk_Client_Genere1_idx` (`idGenere` ASC),
    INDEX `fk_client_domicili1_idx` (`idDomicili` ASC),
    CONSTRAINT `fk_client_domicili1`
      FOREIGN KEY (`idDomicili`)
      REFERENCES `crm_funeduca`.`domicili` (`idDomicili`),
    CONSTRAINT `fk_Client_Genere1`
      FOREIGN KEY (`idGenere`)
      REFERENCES `crm_funeduca`.`genere` (`idGenere`),
    CONSTRAINT `fk_Usuarios_Curs_actual2`
      FOREIGN KEY (`Curs_actual`)
      REFERENCES `crm_funeduca`.`curs_actual` (`idCurs_actual`),
    CONSTRAINT `fk_Usuarios_Familias1`
      FOREIGN KEY (`idFamilia`)
      REFERENCES `crm_funeduca`.`familia` (`idFamilia`),
    CONSTRAINT `fk_Usuarios_Motiux_baixa1`
      FOREIGN KEY (`Motiu_baixa`)
      REFERENCES `crm_funeduca`.`motiu_baixa` (`idMotiu_baixa`),
    CONSTRAINT `fk_Usuarios_Paisos_nacionalitat1`
      FOREIGN KEY (`Pais_naixement`)
      REFERENCES `crm_funeduca`.`pais` (`idPais`),
    CONSTRAINT `fk_Usuarios_Resultats_academics1`
      FOREIGN KEY (`Resultat_academic`)
      REFERENCES `crm_funeduca`.`resultat_academic` (`idResultat_academic`),
    CONSTRAINT `fk_Usuarios_Risc1`
      FOREIGN KEY (`Risc`)
      REFERENCES `crm_funeduca`.`risc` (`idRisc`),
    CONSTRAINT `fk_Usuarios_Rols1`
      FOREIGN KEY (`idRol`)
      REFERENCES `crm_funeduca`.`rol` (`idRol`),
    CONSTRAINT `fk_Usuarios_Sebas1`
      FOREIGN KEY (`idSebas`)
      REFERENCES `crm_funeduca`.`sebas` (`idSebas`),
    CONSTRAINT `fk_Usuarios_Situacio_laboral1`
      FOREIGN KEY (`idSituacio_economica`)
      REFERENCES `crm_funeduca`.`situacio_economica` (`idSituacio_economica`),
    CONSTRAINT `fk_Client_Necessitats_especials1`
      FOREIGN KEY (`idNecessitat_especial`)
      REFERENCES `crm_funeduca`.`necessitats_especials` (`idNecessitat_especial`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`nacionalitat`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`nacionalitat` (
    `idPais` INT NOT NULL,
    `idClient` INT NOT NULL,
    PRIMARY KEY (`idPais`, `idClient`),
    INDEX `fk_Paisos_nacionalitat_has_Usuarios_Usuarios1_idx` (`idClient` ASC),
    INDEX `fk_Paisos_nacionalitat_has_Usuarios_Paisos_nacionalitat1_idx` (`idPais` ASC),
    CONSTRAINT `fk_Paisos_nacionalitat_has_Usuarios_Paisos_nacionalitat1`
      FOREIGN KEY (`idPais`)
      REFERENCES `crm_funeduca`.`pais` (`idPais`),
    CONSTRAINT `fk_Paisos_nacionalitat_has_Usuarios_Usuarios1`
      FOREIGN KEY (`idClient`)
      REFERENCES `crm_funeduca`.`client` (`idClient`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`necessitats_especials`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`necessitats_especials` (
    `idNecessitat_especial` INT NOT NULL AUTO_INCREMENT,
    `Nom_necessitat` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idNecessitat_especial`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`necessitats_especials_has_client`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`necessitats_especials_has_client` (
    `idNecessitat_especial` INT NOT NULL,
    `idClient` INT NOT NULL,
    PRIMARY KEY (`idNecessitat_especial`, `idClient`),
    INDEX `fk_Necessitats_especials_has_Usuarios_Usuarios1_idx` (`idClient` ASC),
    INDEX `fk_Necessitats_especials_has_Usuarios_Necessitats_especials_idx` (`idNecessitat_especial` ASC),
    CONSTRAINT `fk_Necessitats_especials_has_Usuarios_Necessitats_especials1`
      FOREIGN KEY (`idNecessitat_especial`)
      REFERENCES `crm_funeduca`.`necessitats_especials` (`idNecessitat_especial`),
    CONSTRAINT `fk_Necessitats_especials_has_Usuarios_Usuarios1`
      FOREIGN KEY (`idClient`)
      REFERENCES `crm_funeduca`.`client` (`idClient`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`curs_lectiu`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`curs_lectiu` (
    `idCurs_lectiu` INT NOT NULL AUTO_INCREMENT,
    `Nom_curs_lectiu` VARCHAR(24) NOT NULL,
    PRIMARY KEY (`idCurs_lectiu`))
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`proyectos`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`proyectos` (
    `idProyecto` INT NOT NULL AUTO_INCREMENT,
    `Nom_projecte` VARCHAR(45) NOT NULL,
    `Descripcio` VARCHAR(512) NULL DEFAULT NULL,
    `plazas` INT NOT NULL DEFAULT '0',
    `inscritos` INT NOT NULL DEFAULT '0',
    `fecha_inicio_act` DATE NULL DEFAULT NULL,
    `fecha_fin_act` DATE NULL DEFAULT NULL,
    `idcentre_activitats` INT NOT NULL,
    `idCurs_lectiu` INT NULL DEFAULT NULL,
    PRIMARY KEY (`idProyecto`),
    INDEX `fk_proyectos_centre_activitats1_idx` (`idcentre_activitats` ASC),
    INDEX `fk_proyectos_curs_lectiu1_idx` (`idCurs_lectiu` ASC),
    CONSTRAINT `fk_proyectos_centre_activitats1`
      FOREIGN KEY (`idcentre_activitats`)
      REFERENCES `crm_funeduca`.`centre_activitats` (`idcentre_activitats`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
    CONSTRAINT `fk_proyectos_curs_lectiu1`
      FOREIGN KEY (`idCurs_lectiu`)
      REFERENCES `crm_funeduca`.`curs_lectiu` (`idCurs_lectiu`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION)
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`Nivel_acceso`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`Nivel_acceso` (
    `idNivel_acceso` INT NOT NULL AUTO_INCREMENT,
    `Nom` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`idNivel_acceso`))
  ENGINE = InnoDB;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`usuario_app`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`usuario_app` (
    `idUsuario_APP` INT NOT NULL AUTO_INCREMENT,
    `idNivel_acceso` INT NOT NULL,
    `Nom` VARCHAR(45) NOT NULL,
    `Cognoms` VARCHAR(45) NOT NULL,
    `username` VARCHAR(45) NOT NULL UNIQUE,
    `email` VARCHAR(45) NULL DEFAULT NULL,
    `Telefon` VARCHAR(45) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`idUsuario_APP`, `idNivel_acceso`),
    INDEX `fk_usuario_app_Nivel_acceso1_idx` (`idNivel_acceso` ASC),
    CONSTRAINT `fk_usuario_app_Nivel_acceso1`
      FOREIGN KEY (`idNivel_acceso`)
      REFERENCES `crm_funeduca`.`Nivel_acceso` (`idNivel_acceso`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION)
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`proyectos_has_client`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`proyectos_has_client` (
    `idProyecto` INT NOT NULL,
    `idClient` INT NOT NULL,
    PRIMARY KEY (`idProyecto`, `idClient`),
    INDEX `fk_proyectos_has_client_client1_idx` (`idClient` ASC),
    INDEX `fk_proyectos_has_client_proyectos1_idx` (`idProyecto` ASC),
    CONSTRAINT `fk_proyectos_has_client_proyectos1`
      FOREIGN KEY (`idProyecto`)
      REFERENCES `crm_funeduca`.`proyectos` (`idProyecto`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
    CONSTRAINT `fk_proyectos_has_client_client1`
      FOREIGN KEY (`idClient`)
      REFERENCES `crm_funeduca`.`client` (`idClient`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION)
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;

drop event if exists actualizar_tiempo_entidad_edad ;
delimiter //
create event actualizar_tiempo_entidad_edad
 on schedule every 1 day 
 STARTS CURRENT_TIMESTAMP
on completion preserve
enable
do
begin
	UPDATE client
    SET C_temps_a_lentitat = CONCAT(
    TIMESTAMPDIFF(YEAR, Data_d_alta, CURDATE()),
    ' anys ',
    MOD(TIMESTAMPDIFF(MONTH, Data_d_alta, CURDATE()),12),
    ' mesos'
),
		C_edad = TIMESTAMPDIFF(YEAR, Fecha_nacimiento, CURDATE())
    WHERE Data_d_alta IS NOT NULL;
end //
delimiter ;

  -- -----------------------------------------------------
  -- Table `crm_funeduca`.`Responsables`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `crm_funeduca`.`Responsables` (
    `proyectos_idProyecto` INT NOT NULL,
    `idUsuario_APP` INT NOT NULL,
    `tipus_responsable` TINYINT NOT NULL DEFAULT 1 COMMENT '1=zona, 2=projecte, 3=treballador',
    PRIMARY KEY (`proyectos_idProyecto`, `idUsuario_APP`),
    INDEX `fk_proyectos_has_usuario_app_usuario_app1_idx` (`idUsuario_APP` ASC),
    INDEX `fk_proyectos_has_usuario_app_proyectos1_idx` (`proyectos_idProyecto` ASC),
    CONSTRAINT `fk_proyectos_has_usuario_app_proyectos1`
      FOREIGN KEY (`proyectos_idProyecto`)
      REFERENCES `crm_funeduca`.`proyectos` (`idProyecto`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
    CONSTRAINT `fk_proyectos_has_usuario_app_usuario_app1`
      FOREIGN KEY (`idUsuario_APP`)
      REFERENCES `crm_funeduca`.`usuario_app` (`idUsuario_APP`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION)
  ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4;


  SET SQL_MODE=@OLD_SQL_MODE;
  SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
  SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
