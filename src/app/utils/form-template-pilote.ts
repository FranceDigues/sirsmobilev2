/* eslint-disable no-console */
/**
 * Object used by the component BaseForm, a generic component for building edit forms.
 *
 * /!\I'm a script generated by SIRS DESKTOP! Take a look at the folder 'SirsMobileAndPluginQgis' within the desktop project.
 */
export const formTemplatePilote = {
    "Prestation": {
        "borneDebutId": {
            "name": "borneDebutId",
            "type": "BorneDigue",
            "label": "Borne de début",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "borne_debut_aval": {
            "name": "borne_debut_aval",
            "type": "EBoolean",
            "label": "En amont de la borne de début",
            "reference": false,
            "min": null
        },
        "borne_debut_distance": {
            "name": "borne_debut_distance",
            "type": "EDouble",
            "label": "Distance (borne début)",
            "reference": false,
            "min": null
        },
        "positionDebut": {
            "name": "positionDebut",
            "type": "Point",
            "label": "Position de début",
            "reference": false,
            "min": null
        },
        "prDebut": {
            "name": "prDebut",
            "type": "EFloat",
            "label": "PR de début",
            "reference": false,
            "min": 0
        },
        "borneFinId": {
            "name": "borneFinId",
            "type": "BorneDigue",
            "label": "Borne de fin",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "borne_fin_aval": {
            "name": "borne_fin_aval",
            "type": "EBoolean",
            "label": "En amont de la borne de fin",
            "reference": false,
            "min": null
        },
        "borne_fin_distance": {
            "name": "borne_fin_distance",
            "type": "EDouble",
            "label": "Distance (borne fin)",
            "reference": false,
            "min": null
        },
        "positionFin": {
            "name": "positionFin",
            "type": "Point",
            "label": "Position de fin",
            "reference": false,
            "min": null
        },
        "prFin": {
            "name": "prFin",
            "type": "EFloat",
            "label": "PR de fin",
            "reference": false,
            "min": 0
        },
        "systemeRepId": {
            "name": "systemeRepId",
            "type": "SystemeReperage",
            "label": "Système de repérage",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "longitudeMin": {
            "name": "longitudeMin",
            "type": "EDouble",
            "label": "Longitude min",
            "reference": false,
            "min": null
        },
        "longitudeMax": {
            "name": "longitudeMax",
            "type": "EDouble",
            "label": "Longitude max",
            "reference": false,
            "min": null
        },
        "latitudeMin": {
            "name": "latitudeMin",
            "type": "EDouble",
            "label": "Latitude min",
            "reference": false,
            "min": null
        },
        "latitudeMax": {
            "name": "latitudeMax",
            "type": "EDouble",
            "label": "Latitude max",
            "reference": false,
            "min": null
        },
        "geometryMode": {
            "name": "geometryMode",
            "type": "EString",
            "label": "geometry Mode",
            "reference": false,
            "min": null
        },
        "editedGeoCoordinate": {
            "name": "editedGeoCoordinate",
            "type": "EBooleanObject",
            "label": "Coordonnées Geo éditées",
            "reference": false,
            "min": null
        },
        "linearId": {
            "name": "linearId",
            "type": "TronconDigue",
            "label": "Tronçon",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "photos": {
            "name": "photos",
            "type": "Photo",
            "label": "Photos",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "libelle": {
            "name": "libelle",
            "type": "EString",
            "label": "Libellé",
            "reference": false,
            "min": null
        },
        "coutMetre": {
            "name": "coutMetre",
            "type": "EFloat",
            "label": "Coût au mètre Tronçon (euros HT)",
            "reference": false,
            "min": 0
        },
        "coutGlobal": {
            "name": "coutGlobal",
            "type": "EFloat",
            "label": "Coût global (euros HT)",
            "reference": false,
            "min": 0
        },
        "realisationInterne": {
            "name": "realisationInterne",
            "type": "EBoolean",
            "label": "Réalisation interne",
            "reference": false,
            "min": null
        },
        "coteId": {
            "name": "coteId",
            "type": "RefCote",
            "label": "Côté",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "positionId": {
            "name": "positionId",
            "type": "RefPosition",
            "label": "Position",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "sourceId": {
            "name": "sourceId",
            "type": "RefSource",
            "label": "Source",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "typePrestationId": {
            "name": "typePrestationId",
            "type": "RefPrestation",
            "label": "Type de prestation",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "marcheId": {
            "name": "marcheId",
            "type": "Marche",
            "label": "Marché",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "desordreIds": {
            "name": "desordreIds",
            "type": "Desordre",
            "label": "Désordres",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "evenementHydrauliqueIds": {
            "name": "evenementHydrauliqueIds",
            "type": "EvenementHydraulique",
            "label": "Événements hydrauliques",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "intervenantsIds": {
            "name": "intervenantsIds",
            "type": "Contact",
            "label": "Intervenants",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "rapportEtudeIds": {
            "name": "rapportEtudeIds",
            "type": "RapportEtude",
            "label": "Rapport d'étude",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "documentGrandeEchelleIds": {
            "name": "documentGrandeEchelleIds",
            "type": "DocumentGrandeEchelle",
            "label": "Document à grande échelle",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "observations": {
            "name": "observations",
            "type": "ObservationPrestation",
            "label": "Observations",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "echelleLimnimetriqueIds": {
            "name": "echelleLimnimetriqueIds",
            "type": "EchelleLimnimetrique",
            "label": "Echelles Limnimetriques",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "ouvrageParticulierIds": {
            "name": "ouvrageParticulierIds",
            "type": "OuvrageParticulier",
            "label": "Ouvrages Particuliers",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "reseauTelecomEnergieIds": {
            "name": "reseauTelecomEnergieIds",
            "type": "ReseauTelecomEnergie",
            "label": "Réseaux Telecom Energie",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "ouvrageTelecomEnergieIds": {
            "name": "ouvrageTelecomEnergieIds",
            "type": "OuvrageTelecomEnergie",
            "label": "Ouvrages Telecom Energie",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "ouvrageHydrauliqueAssocieIds": {
            "name": "ouvrageHydrauliqueAssocieIds",
            "type": "OuvrageHydrauliqueAssocie",
            "label": "ouvrages Hydrauliques Associés",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "reseauHydrauliqueFermeIds": {
            "name": "reseauHydrauliqueFermeIds",
            "type": "ReseauHydrauliqueFerme",
            "label": "Reseaux Hydrauliques Fermés",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "reseauHydrauliqueCielOuvertIds": {
            "name": "reseauHydrauliqueCielOuvertIds",
            "type": "ReseauHydrauliqueCielOuvert",
            "label": "Reseaux Hydrauliques à Ciel Ouvert",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "stationPompageIds": {
            "name": "stationPompageIds",
            "type": "StationPompage",
            "label": "Station de Pompages",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "ouvrageVoirieIds": {
            "name": "ouvrageVoirieIds",
            "type": "OuvrageVoirie",
            "label": "Ouvrages de Voirie",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "voieDigueIds": {
            "name": "voieDigueIds",
            "type": "VoieDigue",
            "label": "Voies Digues",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "ouvertureBatardableIds": {
            "name": "ouvertureBatardableIds",
            "type": "OuvertureBatardable",
            "label": "Ouvertures Batardables",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "voieAccesIds": {
            "name": "voieAccesIds",
            "type": "VoieAcces",
            "label": "Voies d'Accès",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "ouvrageFranchissementIds": {
            "name": "ouvrageFranchissementIds",
            "type": "OuvrageFranchissement",
            "label": "Ouvrages de Franchissements",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "globalPrestationIds": {
            "name": "globalPrestationIds",
            "type": "GlobalPrestation",
            "label": "Prestations Globales",
            "reference": true,
            "multiple": -1,
            "containment": false
        }
    },
    "OuvrageAssocieAmenagementHydraulique": {
        "amenagementHydrauliqueId": {
            "name": "amenagementHydrauliqueId",
            "type": "AmenagementHydraulique",
            "label": "Aménagement hydraulique",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "libelle": {
            "name": "libelle",
            "type": "EString",
            "label": "Libellé",
            "reference": false,
            "min": null
        },
        "superficie": {
            "name": "superficie",
            "type": "EFloat",
            "label": "Superficie",
            "reference": false,
            "min": 0
        },
        "hauteur": {
            "name": "hauteur",
            "type": "EFloat",
            "label": "Hauteur",
            "reference": false,
            "min": 0
        },
        "profondeur": {
            "name": "profondeur",
            "type": "EFloat",
            "label": "Profondeur",
            "reference": false,
            "min": 0
        },
        "nombre": {
            "name": "nombre",
            "type": "EInt",
            "label": "Nombre",
            "reference": false,
            "min": 0
        },
        "typeId": {
            "name": "typeId",
            "type": "RefOuvrageAssocieAH",
            "label": "Type d'ouvrage",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "ouvrageDeversant": {
            "name": "ouvrageDeversant",
            "type": "EBoolean",
            "label": "Ouvrage Deversant",
            "reference": false,
            "min": null
        },
        "materiauId": {
            "name": "materiauId",
            "type": "RefMateriau",
            "label": "Materiau",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "amenagementHydrauliqueAssocieIds": {
            "name": "amenagementHydrauliqueAssocieIds",
            "type": "AmenagementHydraulique",
            "label": "Aménagements hydrauliques",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "desordreDependanceAssocieIds": {
            "name": "desordreDependanceAssocieIds",
            "type": "DesordreDependance",
            "label": "Désordres",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "proprietaireIds": {
            "name": "proprietaireIds",
            "type": "Contact",
            "label": "Proprietaires",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "gestionnaireIds": {
            "name": "gestionnaireIds",
            "type": "Organisme",
            "label": "Gestionnaires",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "observations": {
            "name": "observations",
            "type": "ObservationDependance",
            "label": "Observations",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "photos": {
            "name": "photos",
            "type": "PhotoDependance",
            "label": "Photos",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "numCouche": {
            "name": "numCouche",
            "type": "EInt",
            "label": "Numéro de couche",
            "reference": false,
            "min": 0
        },
        "sourceId": {
            "name": "sourceId",
            "type": "RefSource",
            "label": "Source",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "diametre": {
            "name": "diametre",
            "type": "EFloat",
            "label": "Diamètre",
            "reference": false,
            "min": 0
        },
        "cote": {
            "name": "cote",
            "type": "EFloat",
            "label": "Côté",
            "reference": false,
            "min": 0
        },
        "section": {
            "name": "section",
            "type": "EFloat",
            "label": "Section",
            "reference": false,
            "min": 0
        },
        "etatId": {
            "name": "etatId",
            "type": "RefEtat",
            "label": "État",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "fonctionnementId": {
            "name": "fonctionnementId",
            "type": "RefFonctionnementOAAH",
            "label": "Fonctionnement",
            "reference": true,
            "multiple": 1,
            "containment": false
        }
    },
    "PrestationAmenagementHydraulique": {
        "amenagementHydrauliqueId": {
            "name": "amenagementHydrauliqueId",
            "type": "AmenagementHydraulique",
            "label": "Aménagement hydraulique",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "libelle": {
            "name": "libelle",
            "type": "EString",
            "label": "Libellé",
            "reference": false,
            "min": null
        },
        "coutMetre": {
            "name": "coutMetre",
            "type": "EFloat",
            "label": "Coût au mètre (euros HT)",
            "reference": false,
            "min": 0
        },
        "coutGlobal": {
            "name": "coutGlobal",
            "type": "EFloat",
            "label": "Coût global (euros HT)",
            "reference": false,
            "min": 0
        },
        "realisationInterne": {
            "name": "realisationInterne",
            "type": "EBoolean",
            "label": "Réalisation Interne",
            "reference": false,
            "min": null
        },
        "cote": {
            "name": "cote",
            "type": "EFloat",
            "label": "Côté",
            "reference": false,
            "min": 0
        },
        "sourceId": {
            "name": "sourceId",
            "type": "RefSource",
            "label": "Source",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "mesureDiverse": {
            "name": "mesureDiverse",
            "type": "EFloat",
            "label": "Mesure Diverse",
            "reference": false,
            "min": 0
        },
        "typePrestationId": {
            "name": "typePrestationId",
            "type": "RefPrestation",
            "label": "Type de prestation",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "marcheId": {
            "name": "marcheId",
            "type": "Marche",
            "label": "Marché",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "desordreIds": {
            "name": "desordreIds",
            "type": "DesordreDependance",
            "label": "Désordres",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "ouvrageAssocieAmenagementHydrauliqueIds": {
            "name": "ouvrageAssocieAmenagementHydrauliqueIds",
            "type": "OuvrageAssocieAmenagementHydraulique",
            "label": "Ouvrages associés",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "photos": {
            "name": "photos",
            "type": "PhotoDependance",
            "label": "Photos",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "intervenantIds": {
            "name": "intervenantIds",
            "type": "Contact",
            "label": "Intervenants",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "rapportEtudeIds": {
            "name": "rapportEtudeIds",
            "type": "RapportEtude",
            "label": "Rapport d'études",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "evenementHydrauliqueIds": {
            "name": "evenementHydrauliqueIds",
            "type": "EvenementHydraulique",
            "label": "Événements hydrauliques",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "observations": {
            "name": "observations",
            "type": "ObservationDependance",
            "label": "Observations",
            "reference": true,
            "multiple": -1,
            "containment": true
        }
    },
    "AmenagementHydraulique": {
        "libelle": {
            "name": "libelle",
            "type": "EString",
            "label": "Libellé",
            "reference": false,
            "min": null
        },
        "proprietes": {
            "name": "proprietes",
            "type": "ProprieteObjet",
            "label": "Proprietes",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "gestions": {
            "name": "gestions",
            "type": "GestionObjet",
            "label": "Gestions",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "photos": {
            "name": "photos",
            "type": "PhotoDependance",
            "label": "Photos",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "superficie": {
            "name": "superficie",
            "type": "EFloat",
            "label": "Superficie (m²)",
            "reference": false,
            "min": 0
        },
        "capaciteStockage": {
            "name": "capaciteStockage",
            "type": "EFloat",
            "label": "Capacité de stockage (m³)",
            "reference": false,
            "min": 0
        },
        "profondeurMoyenne": {
            "name": "profondeurMoyenne",
            "type": "EFloat",
            "label": "Profondeur moyenne (m)",
            "reference": false,
            "min": 0
        },
        "gestionnaireIds": {
            "name": "gestionnaireIds",
            "type": "Organisme",
            "label": "Gestionnaires",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "fonctionnementId": {
            "name": "fonctionnementId",
            "type": "RefFonctionnementAH",
            "label": "Fonctionnement",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "typeId": {
            "name": "typeId",
            "type": "RefTypeAmenagementHydraulique",
            "label": "Type",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "tronconIds": {
            "name": "tronconIds",
            "type": "TronconDigue",
            "label": "Tronçons",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "observations": {
            "name": "observations",
            "type": "ObservationDependance",
            "label": "Observations",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "proprietaireIds": {
            "name": "proprietaireIds",
            "type": "Contact",
            "label": "Proprietaires",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "organismeId": {
            "name": "organismeId",
            "type": "Organisme",
            "label": "Collectivité compétente",
            "reference": true,
            "multiple": 1,
            "containment": false
        }
    },
    "DesordreDependance": {
        "amenagementHydrauliqueId": {
            "name": "amenagementHydrauliqueId",
            "type": "AmenagementHydraulique",
            "label": "Aménagement hydraulique",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "libelle": {
            "name": "libelle",
            "type": "EString",
            "label": "Libellé",
            "reference": false,
            "min": null
        },
        "dependanceId": {
            "name": "dependanceId",
            "type": "AbstractDependance",
            "label": "Dépendance",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "lieuDit": {
            "name": "lieuDit",
            "type": "EString",
            "label": "Lieu dit",
            "reference": false,
            "min": null
        },
        "cote": {
            "name": "cote",
            "type": "EFloat",
            "label": "Côté",
            "reference": false,
            "min": 0
        },
        "sourceId": {
            "name": "sourceId",
            "type": "RefSource",
            "label": "Source",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "positionId": {
            "name": "positionId",
            "type": "RefPosition",
            "label": "Position",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "categorieDesordreId": {
            "name": "categorieDesordreId",
            "type": "RefCategorieDesordre",
            "label": "Catégorie de désordre",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "typeDesordreId": {
            "name": "typeDesordreId",
            "type": "RefTypeDesordre",
            "label": "Type de désordre",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "observations": {
            "name": "observations",
            "type": "ObservationDependance",
            "label": "Observations",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "evenementHydrauliqueIds": {
            "name": "evenementHydrauliqueIds",
            "type": "EvenementHydraulique",
            "label": "Evènements hydrauliques",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "ouvrageAssocieIds": {
            "name": "ouvrageAssocieIds",
            "type": "OuvrageAssocieAmenagementHydraulique",
            "label": "Ouvrages associés",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "prestationIds": {
            "name": "prestationIds",
            "type": "PrestationAmenagementHydraulique",
            "label": "Prestations",
            "reference": true,
            "multiple": -1,
            "containment": false
        },
        "articleIds": {
            "name": "articleIds",
            "type": "ArticleJournal",
            "label": "Articles",
            "reference": true,
            "multiple": -1,
            "containment": false
        }
    },
    "StructureAmenagementHydraulique": {
        "amenagementHydrauliqueId": {
            "name": "amenagementHydrauliqueId",
            "type": "AmenagementHydraulique",
            "label": "Aménagement hydraulique",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "libelle": {
            "name": "libelle",
            "type": "EString",
            "label": "Libellé",
            "reference": false,
            "min": null
        },
        "numCouche": {
            "name": "numCouche",
            "type": "EInt",
            "label": "Numéro de couche",
            "reference": false,
            "min": 0
        },
        "materiauId": {
            "name": "materiauId",
            "type": "RefMateriau",
            "label": "Materiau",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "observations": {
            "name": "observations",
            "type": "ObservationDependance",
            "label": "Observations",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "sourceId": {
            "name": "sourceId",
            "type": "RefSource",
            "label": "Source",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "photos": {
            "name": "photos",
            "type": "PhotoDependance",
            "label": "Photos",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "epaisseur": {
            "name": "epaisseur",
            "type": "EFloat",
            "label": "Épaisseur (m)",
            "reference": false,
            "min": 0
        },
        "fonctionId": {
            "name": "fonctionId",
            "type": "RefFonction",
            "label": "Fonction",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "natureId": {
            "name": "natureId",
            "type": "RefNature",
            "label": "Nature",
            "reference": true,
            "multiple": 1,
            "containment": false
        }
    },
    "OrganeProtectionCollective": {
        "amenagementHydrauliqueId": {
            "name": "amenagementHydrauliqueId",
            "type": "AmenagementHydraulique",
            "label": "Aménagement hydraulique",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "libelle": {
            "name": "libelle",
            "type": "EString",
            "label": "Libellé",
            "reference": false,
            "min": null
        },
        "cote": {
            "name": "cote",
            "type": "EFloat",
            "label": "Côté",
            "reference": false,
            "min": 0
        },
        "observations": {
            "name": "observations",
            "type": "ObservationDependance",
            "label": "Observations",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "typeId": {
            "name": "typeId",
            "type": "RefTypeOrganeProtectionCollective",
            "label": "Type",
            "reference": true,
            "multiple": 1,
            "containment": false
        },
        "photos": {
            "name": "photos",
            "type": "PhotoDependance",
            "label": "Photos",
            "reference": true,
            "multiple": -1,
            "containment": true
        },
        "etatId": {
            "name": "etatId",
            "type": "RefEtat",
            "label": "État",
            "reference": true,
            "multiple": 1,
            "containment": false
        }
    }
}