-- Migration 001: Afegir clau única a callejero
-- Prevé duplicats en reimportar les dades de carrers.

ALTER TABLE `mydb`.`callejero`
  ADD UNIQUE INDEX `uq_callejero` (`idTipus_via`, `Nom_calle`, `idBarri`, `idCodi_postal`);
