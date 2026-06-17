#!/usr/bin/env node

/**
 * Patches for OutOfMemoryError propagation from native to JS.
 *
 * Three patches are applied:
 *
 * 1. PluginManager.java (cordova-android): Adds a catch for OutOfMemoryError
 *    so it is sent to the JS error callback instead of being swallowed by
 *    CordovaBridge's catch(Throwable) which returns an empty string.
 *
 * 2. SQLitePlugin.js in node_modules/ and plugins/: Replaces the null error
 *    callback in cordova.exec() with a real handler that aborts the transaction.
 *
 * 3. SQLitePlugin.js in platforms/android/: Same patch applied to the file
 *    that cordova prepare generates (wrapped in cordova.define).
 *
 * Called from postinstall in package.json.
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

const SQLITE_ORIGINAL = 'cordova.exec(mycb, null, "SQLitePlugin", "backgroundExecuteSqlBatch"';
const SQLITE_PATCHED =
    'cordova.exec(mycb, function(err) {\n' +
    '      console.error(\'[SQLitePlugin] backgroundExecuteSqlBatch error:\', err);\n' +
    '      txFailure = newSQLError(err);\n' +
    '      tx.executes = [];\n' +
    '      tx.abort(txFailure);\n' +
    '    }, "SQLitePlugin", "backgroundExecuteSqlBatch"';

function patchFile(filePath, label, original, patched, alreadyPatchedCheck) {
    if (!fs.existsSync(filePath)) {
        console.log('[patch] ' + label + ' not found, skipping.');
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes(alreadyPatchedCheck)) {
        console.log('[patch] ' + label + ' already patched, skipping.');
        return;
    }

    if (!content.includes(original)) {
        console.warn('[patch] WARNING: ' + label + ' target code not found. File may have changed.');
        return;
    }

    content = content.replace(original, patched);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[patch] ' + label + ' patched successfully.');
}

// ─── Patch 1: PluginManager.java ───

patchFile(
    path.join(projectRoot, 'node_modules', 'cordova-android',
        'framework', 'src', 'org', 'apache', 'cordova', 'PluginManager.java'),
    'PluginManager.java (node_modules)',
    '} catch (Exception e) {\n' +
    '            LOG.e(TAG, "Uncaught exception from plugin", e);\n' +
    '            callbackContext.error(e.getMessage());',
    '} catch (OutOfMemoryError e) {\n' +
    '            LOG.e(TAG, "OutOfMemoryError from plugin " + service + "." + action, e);\n' +
    '            System.gc();\n' +
    '            callbackContext.error("OUT_OF_MEMORY: " + e.getMessage());\n' +
    '        } catch (Exception e) {\n' +
    '            LOG.e(TAG, "Uncaught exception from plugin", e);\n' +
    '            callbackContext.error(e.getMessage());',
    'OutOfMemoryError'
);

// ─── Patch 2: SQLitePlugin.js (node_modules) ───

patchFile(
    path.join(projectRoot, 'node_modules', 'cordova-sqlite-storage',
        'www', 'SQLitePlugin.js'),
    'SQLitePlugin.js (node_modules)',
    SQLITE_ORIGINAL, SQLITE_PATCHED,
    'backgroundExecuteSqlBatch error'
);

// ─── Patch 3: SQLitePlugin.js (platform_www - source used by cordova prepare) ───

patchFile(
    path.join(projectRoot, 'platforms', 'android', 'platform_www',
        'plugins', 'cordova-sqlite-storage', 'www', 'SQLitePlugin.js'),
    'SQLitePlugin.js (platform_www)',
    SQLITE_ORIGINAL, SQLITE_PATCHED,
    'backgroundExecuteSqlBatch error'
);

// ─── Patch 4: SQLitePlugin.js (assets/www - final output) ───

patchFile(
    path.join(projectRoot, 'platforms', 'android', 'app', 'src', 'main',
        'assets', 'www', 'plugins', 'cordova-sqlite-storage', 'www', 'SQLitePlugin.js'),
    'SQLitePlugin.js (assets/www)',
    SQLITE_ORIGINAL, SQLITE_PATCHED,
    'backgroundExecuteSqlBatch error'
);

// ─── Patch 5: PluginManager.java (platforms/android) ───

patchFile(
    path.join(projectRoot, 'platforms', 'android',
        'CordovaLib', 'src', 'org', 'apache', 'cordova', 'PluginManager.java'),
    'PluginManager.java (platforms/android)',
    '} catch (Exception e) {\n' +
    '            LOG.e(TAG, "Uncaught exception from plugin", e);\n' +
    '            callbackContext.error(e.getMessage());',
    '} catch (OutOfMemoryError e) {\n' +
    '            LOG.e(TAG, "OutOfMemoryError from plugin " + service + "." + action, e);\n' +
    '            System.gc();\n' +
    '            callbackContext.error("OUT_OF_MEMORY: " + e.getMessage());\n' +
    '        } catch (Exception e) {\n' +
    '            LOG.e(TAG, "Uncaught exception from plugin", e);\n' +
    '            callbackContext.error(e.getMessage());',
    'OutOfMemoryError'
);

// ─── Patch 6: cordova-sqlite-storage JARs (16KB alignment) ───
//
// cordova-sqlite-storage's beforePluginInstall.js runs "npm install" inside
// plugins/cordova-sqlite-storage/, which may resolve an older version of
// cordova-sqlite-storage-dependencies whose .so files are aligned to 4KB only.
// Android 16 (API 36) requires 16KB alignment. We overwrite those JARs with
// the ones from node_modules/ which are guaranteed 16KB-aligned (v5.0.0).

const sqliteDepsJars = [
    'sqlite-native-ndk-connector.jar',
    'sqlite-ndk-native-driver.jar'
];

const sqlitePluginLibsDir = path.join(
    projectRoot, 'plugins', 'cordova-sqlite-storage',
    'node_modules', 'cordova-sqlite-storage-dependencies', 'libs'
);

const sqliteNodeModulesLibsDir = path.join(
    projectRoot, 'node_modules', 'cordova-sqlite-storage-dependencies', 'libs'
);

if (fs.existsSync(sqlitePluginLibsDir)) {
    sqliteDepsJars.forEach(function (jar) {
        const src = path.join(sqliteNodeModulesLibsDir, jar);
        const dest = path.join(sqlitePluginLibsDir, jar);
        if (!fs.existsSync(src)) {
            console.warn('[patch] WARNING: ' + jar + ' not found in node_modules, skipping.');
            return;
        }
        fs.copyFileSync(src, dest);
        console.log('[patch] ' + jar + ' replaced with 16KB-aligned version.');
    });
} else {
    console.log('[patch] cordova-sqlite-storage plugin libs not found yet, skipping JAR patch.');
}
