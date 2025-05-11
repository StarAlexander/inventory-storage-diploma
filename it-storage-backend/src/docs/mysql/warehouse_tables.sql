CREATE TABLE IF NOT EXISTS warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS warehouse_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('RECEIPT', 'STORAGE', 'SHIPPING', 'REPAIR') NOT NULL,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE TABLE IF NOT EXISTS warehouse_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    from_zone_id INT,
    to_zone_id INT,
    operation ENUM('RECEIPT', 'PUTAWAY', 'MOVE', 'ISSUE', 'RETURN', 'REPAIR', 'WRITE_OFF') NOT NULL,
    document_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    note TEXT,
    FOREIGN KEY (equipment_id) REFERENCES objects(id),
    FOREIGN KEY (from_zone_id) REFERENCES warehouse_zones(id),
    FOREIGN KEY (to_zone_id) REFERENCES warehouse_zones(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS warehouse_document_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    template TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS warehouse_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    document BLOB NOT NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES warehouse_document_templates(id)
);