-- ============================================================
-- Migració: afegir curs lectiu als projectes
-- Data: 2026-06-22
--
-- Crea la taula `curs_lectiu`, hi insereix els cursos del 20/21
-- al 40/41 i afegeix la columna `idCurs_lectiu` a `proyectos`.
--
-- Pensat per a bases de dades JA EXISTENTS (Base_datos.sql usa
-- CREATE TABLE IF NOT EXISTS i no afegeix la columna a taules ja creades).
-- ============================================================

USE crm_funeduca;

-- 1) Nova taula de cursos lectius -----------------------------
CREATE TABLE IF NOT EXISTS `curs_lectiu` (
  `idCurs_lectiu` INT NOT NULL AUTO_INCREMENT,
  `Nom_curs_lectiu` VARCHAR(24) NOT NULL,
  PRIMARY KEY (`idCurs_lectiu`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4;

-- 2) Dades: cursos del 20/21 al 40/41 -------------------------
--    (només s'insereixen si la taula encara és buida)
INSERT INTO `curs_lectiu` (`Nom_curs_lectiu`)
SELECT * FROM (
  SELECT '20/21' UNION ALL SELECT '21/22' UNION ALL SELECT '22/23' UNION ALL
  SELECT '23/24' UNION ALL SELECT '24/25' UNION ALL SELECT '25/26' UNION ALL
  SELECT '26/27' UNION ALL SELECT '27/28' UNION ALL SELECT '28/29' UNION ALL
  SELECT '29/30' UNION ALL SELECT '30/31' UNION ALL SELECT '31/32' UNION ALL
  SELECT '32/33' UNION ALL SELECT '33/34' UNION ALL SELECT '34/35' UNION ALL
  SELECT '35/36' UNION ALL SELECT '36/37' UNION ALL SELECT '37/38' UNION ALL
  SELECT '38/39' UNION ALL SELECT '39/40' UNION ALL SELECT '40/41'
) AS nous
WHERE NOT EXISTS (SELECT 1 FROM `curs_lectiu`);

-- 3) Columna nova a proyectos ---------------------------------
--    MySQL < 8.0 no suporta ADD COLUMN IF NOT EXISTS(aqui iba un punto y coma) aquest bloc
--    afegeix la columna només si encara no existeix.
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'crm_funeduca'
    AND TABLE_NAME = 'proyectos'
    AND COLUMN_NAME = 'idCurs_lectiu'
);
SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE `proyectos` ADD COLUMN `idCurs_lectiu` INT NULL DEFAULT NULL',
  'SELECT "columna idCurs_lectiu ja existeix"');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4) Clau forana (només si encara no existeix) ----------------
SET @fk_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = 'crm_funeduca'
    AND TABLE_NAME = 'proyectos'
    AND CONSTRAINT_NAME = 'fk_proyectos_curs_lectiu1'
);
SET @ddl_fk := IF(@fk_exists = 0,
  'ALTER TABLE `proyectos`
     ADD INDEX `fk_proyectos_curs_lectiu1_idx` (`idCurs_lectiu` ASC),
     ADD CONSTRAINT `fk_proyectos_curs_lectiu1`
       FOREIGN KEY (`idCurs_lectiu`)
       REFERENCES `curs_lectiu` (`idCurs_lectiu`)
       ON DELETE NO ACTION ON UPDATE NO ACTION',
  'SELECT "FK fk_proyectos_curs_lectiu1 ja existeix"');
PREPARE stmt_fk FROM @ddl_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;
