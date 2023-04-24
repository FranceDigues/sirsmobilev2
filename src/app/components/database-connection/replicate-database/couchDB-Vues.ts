/* eslint-disable no-console */

declare function emit (val: any);
declare function emit (key: any, value: any);

export const indexedViews = [
    'Utilisateur/byLogin',
    'Element/byClassAndLinear',
    'Document/byPath',
    'TronconDigue/streamLight',
    'objetsModeEdition8/objetsModeEdition8',
    // Local views
    'ElementSpecial3',
    'bySEIdHB',
    'byDigueId',
    'byId',
    'getBornesFromTronconID',
    'getBornesIdsHB',
    'byClassAndLinearRef'
];

export const syncViews = [
    // 'Utilisateur/byLogin',
    // 'Element/byClassAndLinear'
];

export const designDocs = [
    {
        _id: '_design/objetsNonClosByBorne',
        views: {
            byAuthor: {
                map: function (doc) {
                    if (doc.author && !doc.valid
                        && ((doc.positionDebut && !doc.positionFin) || (doc.borneDebutId && !doc.borneFinId))) {
                        emit(doc.author);
                    }
                }.toString()
            }
        }
    },
    {
        _id: '_design/objetsClosByBorne',
        views: {
            byAuthor: {
                map: function (doc) {
                    if (doc.author && !doc.valid && ((doc.positionDebut && doc.positionFin) || (doc.borneDebutId && doc.borneFinId))) {
                        emit(doc.author, {
                            '@class': doc['@class'],
                            'id': doc._id,
                            'rev': doc._rev,
                            'designation': doc.designation,
                            'libelle': doc.libelle,
                            'positionDebut': doc.positionDebut,
                            'positionFin': doc.positionFin
                        });
                    }
                }.toString()
            }
        }
    },
    {
        _id: '_design/objetsModeEdition8',
        views: {
            objetsModeEdition8: {
                map: function (doc) {
                    if (!doc.valid) {
                        if ((doc.positionDebut && doc.positionFin)) {
                            emit(doc._id, doc);
                        } else if (doc.borneDebutId && doc.borneFinId) {
                            emit(doc._id, doc);
                        } else if (doc.geometry) {
                            if (doc['@class'].toLowerCase().indexOf('dependance') > -1
                                || doc['@class'].toLowerCase().indexOf('amenagementhydraulique') > -1
                                || doc['@class'].toLowerCase() === 'fr.sirs.core.model.organeprotectioncollective'
                                || doc['@class'] === 'fr.sirs.core.model.ArbreVegetation'
                                || doc['@class'] === 'fr.sirs.core.model.HerbaceeVegetation'
                                || doc['@class'] === 'fr.sirs.core.model.InvasiveVegetation'
                                || doc['@class'] === 'fr.sirs.core.model.PeuplementVegetation'
                                || doc['@class'].toLowerCase() === 'fr.sirs.core.model.troncondigue') {
                                emit(doc._id, doc);
                            }
                        }
                    }
                }.toString()
            }
        }
    },
    {
        _id: '_design/Document',
        views: {
            byPath: {
                map: function (doc) {
                    if (doc.chemin) {
                        var path = doc.chemin.replace(/\\/g, '/');
                        if (path.indexOf('/')) {
                            path = path.substring(1);
                        }
                        emit(path, {
                            '@class': doc['@class'],
                            'id': doc._id,
                            'rev': doc._rev,
                            'libelle': doc.libelle,
                            'commentaire': doc.commentaire
                        });
                    }
                }.toString()
            }
        }
    },
    {
        _id: '_design/ElementSpecial',
        views: {
            'ElementSpecial': {
                map: function (doc) {
                    if (doc['@class']) {
                        emit([doc['@class'], doc.linearId], {
                            id: doc._id, rev: doc._rev,
                            designation: doc.designation, libelle: doc.libelle,
                            date_fin: doc.date_fin, positionDebut: doc.positionDebut,
                            positionFin: doc.positionFin,
                            geometry: doc.geometry
                        })
                    }
                }.toString()
            }
        }
    },
    {
        _id: '_design/ElementSpecial3',
        views: {
            'ElementSpecial3': {
                map: function (doc) {
                    if (doc['@class'] && doc.valid) {
                        emit([doc['@class'], doc.linearId], {
                            id: doc._id, rev: doc._rev,
                            designation: doc.designation, libelle: doc.libelle,
                            date_fin: doc.date_fin, positionDebut: doc.positionDebut,
                            positionFin: doc.positionFin,
                            geometry: doc.geometry
                        })
                    }
                }.toString()
            }
        }
    },
    {
        _id: '_design/bySEIdHB',
        views: {
            'bySEIdHB': {
                map: function (doc) {
                    if (doc['@class'] === 'fr.sirs.core.model.Digue') {
                        emit(doc.systemeEndiguementId, {
                            id: doc._id,
                            libelle: doc.libelle
                        })
                    }
                }.toString()
            }
        }
    },
    {
        _id: '_design/byDigueId',
        views: {
            'byDigueId': {
                map: function (doc) {
                    if (doc['@class'] && doc.digueId) {
                        emit(doc.digueId, doc)
                    }
                }.toString()
            }
        }
    },
    {
        _id: '_design/byId',
        views: {
            'byId': {
                map: function (doc) {
                    if (doc._id) {
                        emit(doc._id, doc)
                    }
                }.toString()
            }
        }
    },
    {
        _id: '_design/getBornesFromTronconID',
        views: {
            'getBornesFromTronconID': {
                map: function (doc) {
                    if (Array.isArray(doc.borneIds)) {
                        for (var i = 0; i < doc.borneIds.length; i++) emit(doc._id, doc.borneIds[i])
                    }
                }.toString()
            }
        }
    },
    {
        _id: '_design/getBornesIdsHB',
        views: {
            'getBornesIdsHB': {
                map: function (doc) {
                    if (doc['@class'] === 'fr.sirs.core.model.BorneDigue') {
                        emit(doc._id, {
                            id: doc._id, rev: doc._rev,
                            designation: doc.designation, libelle: doc.libelle,
                            date_fin: doc.date_fin, positionDebut: doc.positionDebut,
                            positionFin: doc.positionFin,
                            geometry: doc.geometry
                        })
                    }
                }.toString()
            }
        }
    },
    {
        _id: '_design/getAllFilesAttachments',
        views: {
            'getAllFilesAttachments': {
                map: function (doc) {
                    if (doc._attachments) {
                        emit(doc._id, {chemin: doc.chemin, attachments: doc._attachments});
                    }
                }.toString()
            }
        }
    },
    {
        _id: '_design/byClassAndLinearRef',
        views: {
            'byClassAndLinearRef': {
                map: function (doc) {
                    if (doc['@class']) {
                        emit([doc['@class'], doc.linearId], {
                            id: doc._id,
                            rev: doc._rev,
                            designation: doc.designation,
                            libelle: doc.libelle,
                            abrege: doc.abrege
                        })
                    }
                }.toString()
            }
        }
    }
]; // TODO → make it configurable ?
