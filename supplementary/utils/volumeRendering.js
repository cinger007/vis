/**
 * 加载RAW格式体积数据
 * @param {string} url 数据文件URL
 * @param {Object} dimensions 数据尺寸 {width, height, depth}
 * @param {string} dataType 数据类型 ('uint8', 'uint16', 'float32')
 */
async function loadRawVolumeData(url, dimensions, dataType = 'uint8') {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        
        let data;
        switch(dataType) {
            case 'uint8':
                data = new Uint8Array(arrayBuffer);
                break;
            case 'uint16':
                data = new Uint16Array(arrayBuffer);
                break;
            case 'float32':
                data = new Float32Array(arrayBuffer);
                break;
            default:
                throw new Error(`Unsupported data type: ${dataType}`);
        }
        
        // 验证数据大小是否匹配
        const expectedSize = dimensions.width * dimensions.height * dimensions.depth;
        if (dataType === 'uint16') expectedSize *= 2;
        if (dataType === 'float32') expectedSize *= 4;
        
        if (data.byteLength !== expectedSize) {
            console.warn(`Data size mismatch! Expected ${expectedSize}, got ${data.byteLength}. Check dimensions and data type.`);
        }
        
        return {
            data: data,
            dimensions: dimensions,
            type: dataType
        };
    } catch (error) {
        console.error('Failed to load RAW volume data:', error);
        throw error;
    }
}

/**
 * 将体积数据转换为2D纹理
 */
function volumeDataToTexture(gl, volumeData) {
    const { data, dimensions } = volumeData;
    
    // 计算纹理布局（将3D数据平铺到2D纹理上）
    const tilesX = Math.ceil(Math.sqrt(dimensions.depth));
    const tilesY = Math.ceil(dimensions.depth / tilesX);
    
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width * tilesX;
    canvas.height = dimensions.height * tilesY;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    
    // 标准化数据（根据数据类型）
    const normalizedData = normalizeVolumeData(data, volumeData.type);
    
    // 填充纹理
    for (let z = 0; z < dimensions.depth; z++) {
        const tileX = z % tilesX;
        const tileY = Math.floor(z / tilesX);
        
        for (let y = 0; y < dimensions.height; y++) {
            for (let x = 0; x < dimensions.width; x++) {
                const sourceIndex = x + y * dimensions.width + z * dimensions.width * dimensions.height;
                const targetX = tileX * dimensions.width + x;
                const targetY = tileY * dimensions.height + y;
                const targetIndex = (targetX + targetY * canvas.width) * 4;
                
                const value = normalizedData[sourceIndex];
                imageData.data[targetIndex] = value;     // R
                imageData.data[targetIndex + 1] = value; // G
                imageData.data[targetIndex + 2] = value; // B
                imageData.data[targetIndex + 3] = 255;   // A
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // 创建WebGL纹理
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    return {
        texture: texture,
        tilesX: tilesX,
        tilesY: tilesY
    };
}

/**
 * 标准化体积数据到0-255范围
 */
function normalizeVolumeData(data, dataType) {
    const normalized = new Uint8Array(data.length);
    
    let min, max;
    if (dataType === 'uint8') {
        min = 0; max = 255;
    } else {
        // 计算数据范围
        min = Infinity;
        max = -Infinity;
        for (let i = 0; i < data.length; i++) {
            if (data[i] < min) min = data[i];
            if (data[i] > max) max = data[i];
        }
    }
    
    const range = max - min;
    for (let i = 0; i < data.length; i++) {
        normalized[i] = ((data[i] - min) / range) * 255;
    }
    
    return normalized;
}

// 使用示例
async function setupVolumeRendering() {
    const gl = canvas.getContext('webgl');
    
    try {
        // 加载真实的体积数据
        const volumeData = await loadRawVolumeData(
            'path/to/your/volume.raw',
            { width: 256, height: 256, depth: 100 },
            'uint16'
        );
        
        // 转换为纹理
        const textureInfo = volumeDataToTexture(gl, volumeData);
        
        // 设置着色器uniform
        gl.uniform1i(gl.getUniformLocation(program, 'volumeData'), 0);
        gl.uniform3f(gl.getUniformLocation(program, 'volumeDims'), 
                    volumeData.dimensions.width, 
                    volumeData.dimensions.height, 
                    volumeData.dimensions.depth);
        gl.uniform2f(gl.getUniformLocation(program, 'textureTiles'), 
                    textureInfo.tilesX, textureInfo.tilesY);
        
        // 渲染循环...
        
    } catch (error) {
        console.error('Failed to setup volume rendering:', error);
        // 可以回退到模拟数据
        setupFallbackVolume();
    }
}