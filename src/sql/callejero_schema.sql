CREATE TABLE IF NOT EXISTS `mydb`.`tipus_via` (
  `idTipus_via` INT NOT NULL AUTO_INCREMENT,
  `Nom` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`idTipus_via`),
  UNIQUE INDEX `Nom_UNIQUE` (`Nom`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `mydb`.`barri` (
  `idBarri` INT NOT NULL AUTO_INCREMENT,
  `Nom` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`idBarri`),
  UNIQUE INDEX `Nom_UNIQUE` (`Nom`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `mydb`.`codi_postal` (
  `idCodi_postal` INT NOT NULL AUTO_INCREMENT,
  `Codi` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`idCodi_postal`),
  UNIQUE INDEX `Codi_UNIQUE` (`Codi`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `mydb`.`callejero` (
  `idCallejero` INT NOT NULL AUTO_INCREMENT,
  `idTipus_via` INT NOT NULL,
  `Nom_calle` VARCHAR(255) NOT NULL,
  `Nom_complet` VARCHAR(255) NOT NULL,
  `idBarri` INT NULL,
  `idCodi_postal` INT NULL,
  PRIMARY KEY (`idCallejero`),
  UNIQUE INDEX `uq_callejero` (`idTipus_via`, `Nom_calle`, `idBarri`, `idCodi_postal`),
  INDEX `fk_callejero_tipus_via_idx` (`idTipus_via`),
  INDEX `fk_callejero_barri_idx` (`idBarri`),
  INDEX `fk_callejero_codi_postal_idx` (`idCodi_postal`),
  CONSTRAINT `fk_callejero_tipus_via` FOREIGN KEY (`idTipus_via`) REFERENCES `mydb`.`tipus_via` (`idTipus_via`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_callejero_barri` FOREIGN KEY (`idBarri`) REFERENCES `mydb`.`barri` (`idBarri`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_callejero_codi_postal` FOREIGN KEY (`idCodi_postal`) REFERENCES `mydb`.`codi_postal` (`idCodi_postal`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;
