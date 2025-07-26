-- Create productos table
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    imagen TEXT NOT NULL,
    descripcion TEXT,
    producto TEXT,
    img_opcionales TEXT[],
    
    -- Gallery images
    imagen_hover TEXT,
    imagenes TEXT[],
    
    -- Variant attributes
    capacidad VARCHAR(50),
    abrasivo VARCHAR(100),
    acabado VARCHAR(50),
    color VARCHAR(50),
    grano VARCHAR(50),
    kilos VARCHAR(50),
    
    -- Pricing
    precio_original DECIMAL(10,2),
    precio DECIMAL(10,2),
    off INTEGER,
    precio_final DECIMAL(10,2),
    
    -- Sales types
    precio_unidad DECIMAL(10,2),
    stock_unidad INTEGER,
    precio_caja DECIMAL(10,2),
    unidades_por_caja INTEGER,
    stock_caja INTEGER,
    
    -- UX flags
    es_nuevo BOOLEAN DEFAULT FALSE,
    mas_vendido BOOLEAN DEFAULT FALSE,
    stock INTEGER DEFAULT 0,
    
    -- Reviews
    rating DECIMAL(2,1),
    reviews_count INTEGER DEFAULT 0,
    
    -- Technical specifications (JSONB for flexible key-value pairs)
    especificaciones JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_marca ON productos(marca);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos USING gin(to_tsvector('spanish', nombre));
CREATE INDEX IF NOT EXISTS idx_productos_precio ON productos(precio);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock);

-- Create variants table for product variants
CREATE TABLE IF NOT EXISTS producto_variantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_principal_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    variante_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_productos_updated_at 
    BEFORE UPDATE ON productos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();