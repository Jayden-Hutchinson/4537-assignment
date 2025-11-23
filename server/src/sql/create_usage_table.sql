CREATE TABLE IF NOT EXISTS `usage_events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) DEFAULT NULL,
  `method` VARCHAR(10) NOT NULL,
  `endpoint` VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`email`),
  INDEX (`method`),
  INDEX (`endpoint`)
);
