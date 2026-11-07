// Script de build personnalisé avec vérifications WebGL pour Mondes Immergés
import { build } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de build personnalisé avec vérifications WebGL et optimisations
 */
async function buildWithChecks() {
    console.log('🚀 Démarrage du build optimisé pour GitHub Pages...\n');
    
    const startTime = Date.now();
    
    try {
        // 1. Vérifier les fichiers critiques
        console.log('📁 Vérification des fichiers critiques...');
        await checkCriticalFiles();
        
        // 2. Vérifier les shaders dans le code
        console.log('\n🎨 Vérification des shaders WebGL...');
        await checkShaders();
        
        // 3. Vérifier les assets
        console.log('\n🖼️  Vérification des assets...');
        await checkAssets();
        
        // 4. Nettoyer le dossier de build précédent
        console.log('\n🧹 Nettoyage du build précédent...');
        cleanPreviousBuild();
        
        // 5. Lancer le build Vite avec configuration optimisée
        console.log('\n🔨 Construction avec Vite (mode production)...');
        await buildWithVite();
        
        // 6. Vérifications post-build
        console.log('\n🔍 Vérifications post-build...');
        await postBuildChecks();
        
        // 7. Optimisations finales
        console.log('\n⚡ Optimisations finales...');
        await finalOptimizations();
        
        // 8. Statistiques du build
        const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('\n📊 Statistiques du build:');
        await showBuildStats();
        
        console.log(`\n✨ Build terminé avec succès en ${buildTime}s!`);
        console.log('🚀 Prêt pour le déploiement sur GitHub Pages');
        console.log('\n💡 Pour déployer: npm run deploy');
        
    } catch (error) {
        console.error('\n❌ Erreur lors du build:');
        console.error(error.message);
        if (error.stack) {
            console.error('\n📋 Stack trace:');
            console.error(error.stack);
        }
        process.exit(1);
    }
}

/**
 * Vérifie les fichiers critiques de l'application
 */
async function checkCriticalFiles() {
    const criticalFiles = [
        'index.html',
        'src/main.js',
        'src/app.js',
        'src/modules/GlobeManager.js',
        'src/modules/VisualEffects.js',
        'src/modules/Interaction.js',
        'src/modules/InterfaceUI.js',
        'src/data/hotspots.js',
        'src/data/redirect-config.js',
        'src/styles/main.css',
        'package.json',
        'vite.config.js'
    ];
    
    const missingFiles = [];
    
    for (const file of criticalFiles) {
        if (!fs.existsSync(file)) {
            missingFiles.push(file);
            console.log(`❌ ${file} - MANQUANT`);
        } else {
            console.log(`✅ ${file}`);
        }
    }
    
    if (missingFiles.length > 0) {
        throw new Error(`Fichiers critiques manquants: ${missingFiles.join(', ')}`);
    }
    
    console.log(`✅ Tous les fichiers critiques (${criticalFiles.length}) sont présents`);
}

/**
 * Vérifie les shaders WebGL dans le code
 */
async function checkShaders() {
    const filesToCheck = [
        'src/modules/GlobeManager.js',
        'src/modules/VisualEffects.js'
    ];
    
    let totalShaders = 0;
    let validShaders = 0;
    
    for (const file of filesToCheck) {
        if (!fs.existsSync(file)) continue;
        
        const content = fs.readFileSync(file, 'utf8');
        
        // Chercher les fragment shaders
        const fragmentShaderMatches = content.match(/fragmentShader:\s*`([^`]*)`/g);
        
        if (fragmentShaderMatches) {
            fragmentShaderMatches.forEach((match, index) => {
                totalShaders++;
                
                if (match.includes('#ifdef GL_ES') && match.includes('precision')) {
                    validShaders++;
                    console.log(`✅ Fragment shader ${index + 1} dans ${file} - OK`);
                } else {
                    console.warn(`⚠️  Fragment shader ${index + 1} dans ${file} - Manque déclaration de précision`);
                }
            });
        }
        
        // Chercher les vertex shaders
        const vertexShaderMatches = content.match(/vertexShader:\s*`([^`]*)`/g);
        
        if (vertexShaderMatches) {
            vertexShaderMatches.forEach((match, index) => {
                console.log(`ℹ️  Vertex shader ${index + 1} dans ${file} trouvé`);
            });
        }
    }
    
    console.log(`📊 Shaders analysés: ${totalShaders} fragment shaders`);
    console.log(`✅ Shaders valides: ${validShaders}/${totalShaders}`);
    
    if (validShaders < totalShaders) {
        console.warn('⚠️  Certains shaders n\'ont pas de déclaration de précision - Risque d\'erreur WebGL');
    }
}

/**
 * Vérifie les assets nécessaires
 */
async function checkAssets() {
    const assetPaths = [
        'public/images',
        'public/videos',
        'src/styles'
    ];
    
    const requiredAssets = [
        'public/images/nat-geo-logo.png',
        'public/images/night-sky.png',
        'src/styles/main.css'
    ];
    
    // Vérifier les dossiers d'assets
    for (const assetPath of assetPaths) {
        if (fs.existsSync(assetPath)) {
            const files = fs.readdirSync(assetPath);
            console.log(`✅ ${assetPath} - ${files.length} fichiers`);
        } else {
            console.warn(`⚠️  ${assetPath} - Dossier manquant`);
        }
    }
    
    // Vérifier les assets requis
    for (const asset of requiredAssets) {
        if (fs.existsSync(asset)) {
            const stats = fs.statSync(asset);
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`✅ ${asset} - ${sizeKB} KB`);
        } else {
            console.warn(`⚠️  ${asset} - Fichier manquant`);
        }
    }
}

/**
 * Nettoie le build précédent
 */
function cleanPreviousBuild() {
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
        console.log('🗑️  Dossier dist supprimé');
    }
    
    console.log('✅ Nettoyage terminé');
}

/**
 * Lance le build Vite avec configuration personnalisée
 */
async function buildWithVite() {
    try {
        await build({
            configFile: 'vite.config.js',
            mode: 'production',
            logLevel: 'info',
            build: {
                // Surcharger certaines options si nécessaire
                reportCompressedSize: true,
                chunkSizeWarningLimit: 2000 // Augmenté pour Three.js
            }
        });
        
        console.log('✅ Build Vite terminé avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors du build Vite:', error);
        throw error;
    }
}

/**
 * Effectue les vérifications post-build
 */
async function postBuildChecks() {
    // Vérifier que les fichiers essentiels existent
    const requiredDistFiles = [
        'dist/index.html',
        'dist/assets'
    ];
    
    for (const file of requiredDistFiles) {
        if (!fs.existsSync(file)) {
            throw new Error(`Fichier de build manquant: ${file}`);
        }
        console.log(`✅ ${file} généré`);
    }
    
    // Vérifier le contenu de index.html
    const indexContent = fs.readFileSync('dist/index.html', 'utf8');
    
    if (!indexContent.includes('/Mondes-immerges/interface/')) {
        console.warn('⚠️  Base URL GitHub Pages non détectée dans index.html');
    } else {
        console.log('✅ Base URL GitHub Pages correctement configurée');
    }
    
    // Vérifier que les scripts sont présents
    if (indexContent.includes('type="module"')) {
        console.log('✅ Modules ES détectés dans index.html');
    }
    
    console.log('✅ Vérifications post-build terminées');
}

/**
 * Optimisations finales du build
 */
async function finalOptimizations() {
    const assetsDir = 'dist/assets';
    
    if (!fs.existsSync(assetsDir)) {
        console.warn('⚠️  Dossier assets non trouvé');
        return;
    }
    
    // Lister les fichiers générés
    const files = fs.readdirSync(assetsDir);
    
    // Analyser les chunks JavaScript
    const jsFiles = files.filter(file => file.endsWith('.js'));
    const cssFiles = files.filter(file => file.endsWith('.css'));
    const assetFiles = files.filter(file => !file.endsWith('.js') && !file.endsWith('.css'));
    
    console.log(`📦 ${jsFiles.length} fichiers JavaScript générés`);
    console.log(`🎨 ${cssFiles.length} fichiers CSS générés`);
    console.log(`🖼️  ${assetFiles.length} autres assets`);
    
    // Créer un fichier .htaccess pour GitHub Pages (optionnel)
    const htaccessContent = `
# Cache pour les assets statiques
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
    ExpiresByType video/mp4 "access plus 1 month"
    ExpiresByType video/webm "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 week"
    ExpiresByType text/css "access plus 1 week"
</IfModule>

# Compression GZIP
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Headers pour WebGL
<IfModule mod_headers.c>
    Header set Cross-Origin-Embedder-Policy "credentialless"
    Header set Cross-Origin-Opener-Policy "same-origin"
</IfModule>
`;
    
    // Écrire le fichier .htaccess (commenté car GitHub Pages ne le supporte pas toujours)
    // fs.writeFileSync('dist/.htaccess', htaccessContent.trim());
    // console.log('✅ Fichier .htaccess créé');
    
    console.log('✅ Optimisations finales terminées');
}

/**
 * Affiche les statistiques détaillées du build
 */
async function showBuildStats() {
    const distStats = fs.statSync('dist');
    console.log(`📁 Dossier dist créé: ${distStats.isDirectory()}`);
    
    // Calculer la taille totale
    let totalSize = 0;
    
    function calculateDirSize(dirPath) {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                calculateDirSize(filePath);
            } else {
                totalSize += stats.size;
            }
        }
    }
    
    calculateDirSize('dist');
    
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`📊 Taille totale du build: ${totalSizeMB} MB`);
    
    // Analyser les chunks principaux
    const assetsDir = 'dist/assets';
    if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        
        console.log('\n📦 Analyse des chunks principaux:');
        
        // Trier par taille décroissante
        const fileStats = files
            .map(file => {
                const filePath = path.join(assetsDir, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    size: stats.size,
                    sizeKB: (stats.size / 1024).toFixed(2)
                };
            })
            .sort((a, b) => b.size - a.size)
            .slice(0, 10); // Top 10
        
        fileStats.forEach(file => {
            let type = '📄';
            if (file.name.endsWith('.js')) type = '📜';
            else if (file.name.endsWith('.css')) type = '🎨';
            else if (file.name.match(/\.(jpg|jpeg|png|webp)$/)) type = '🖼️';
            else if (file.name.match(/\.(mp4|webm|ogg)$/)) type = '🎬';
            
            console.log(`   ${type} ${file.name}: ${file.sizeKB} KB`);
        });
    }
    
    // Vérifications finales de sécurité
    console.log('\n🔒 Vérifications de sécurité:');
    
    const indexHtml = fs.readFileSync('dist/index.html', 'utf8');
    
    // Vérifier qu'il n'y a pas de console.log en production
    const hasConsoleLogs = indexHtml.includes('console.log') || 
                          fs.readdirSync('dist/assets')
                            .filter(f => f.endsWith('.js'))
                            .some(f => {
                                const content = fs.readFileSync(path.join('dist/assets', f), 'utf8');
                                return content.includes('console.log');
                            });
    
    if (hasConsoleLogs) {
        console.warn('⚠️  Console.log détectés en production');
    } else {
        console.log('✅ Pas de console.log en production');
    }
    
    // Vérifier les chemins absolus
    if (indexHtml.includes('http://localhost') || indexHtml.includes('127.0.0.1')) {
        console.warn('⚠️  Chemins localhost détectés - Risque en production');
    } else {
        console.log('✅ Pas de chemins localhost');
    }
    
    console.log('✅ Vérifications de sécurité terminées');
}

/**
 * Fonction utilitaire pour formater les tailles de fichiers
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validation finale avant déploiement
 */
async function validateForDeployment() {
    console.log('\n🔍 Validation finale pour déploiement...');
    
    const criticalChecks = [
        () => fs.existsSync('dist/index.html'),
        () => fs.existsSync('dist/assets'),
        () => fs.readFileSync('dist/index.html', 'utf8').includes('/Mondes-immerges/interface/'),
        () => {
            const assets = fs.readdirSync('dist/assets');
            return assets.some(f => f.endsWith('.js')) && assets.some(f => f.endsWith('.css'));
        }
    ];
    
    const results = criticalChecks.map(check => check());
    const allPassed = results.every(result => result);
    
    if (allPassed) {
        console.log('✅ Toutes les validations sont passées');
        console.log('🚀 Build prêt pour le déploiement GitHub Pages');
    } else {
        console.error('❌ Certaines validations ont échoué');
        throw new Error('Build non valide pour le déploiement');
    }
}

// Lancer le script avec gestion d'erreur globale
process.on('uncaughtException', (error) => {
    console.error('\n💥 Erreur non gérée:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('\n💥 Promise rejetée non gérée:', reason);
    process.exit(1);
});

// Point d'entrée principal
if (import.meta.url === `file://${process.argv[1]}`) {
    buildWithChecks()
        .then(() => validateForDeployment())
        .then(() => {
            console.log('\n🎉 Build et validation terminés avec succès!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Échec du build:', error.message);
            process.exit(1);
        });
}

export { buildWithChecks };