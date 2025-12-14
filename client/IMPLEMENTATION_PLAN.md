# Plan d'implémentation - Retours utilisateurs

## MODULE ADMIN - Corrections critiques

### ✅ Gestion GPS
- **Fichier**: `app/(admin)/gps-tracking.tsx`
- **Status**: ✅ DÉJÀ IMPLÉMENTÉ
- Le suivi GPS est fonctionnel avec MapView, marqueurs, auto-refresh

### ✅ Règlements du soir
- **Fichier**: `app/(admin)/settlements-evening.tsx`
- **Status**: ✅ DÉJÀ IMPLÉMENTÉ
- Fonctionnalité complète avec confirmation bidirectionnelle

### ✅ Liens Client/Livreur
- **Fichiers**: `app/(admin)/clients/index.tsx`, `app/(admin)/couriers/index.tsx`
- **Status**: ✅ DÉJÀ IMPLÉMENTÉ
- Navigation vers détails clients et livreurs fonctionnelle

---

## MODULE CLIENT - Améliorations UX

### 1. ✅ Validation téléphone (030, sans 0)
- **Fichier**: `components/Auth/RegisterPage.tsx` (ligne 56)
- **Action**: Modifier regex pour accepter 030 et numéros sans 0 initial
- **Regex actuelle**: `/^(\+261|0)(3[0-9]|20)\d{7}$/`
- **Nouvelle regex**: `/^(\+261|0)?(30|3[0-9]|20)\d{7}$/`

### 2. 🔄 Parcours création commande - Navigation boutons
- **Fichier**: `app/(client)/orders/new.tsx` (lignes 326-349)
- **Action**: Inverser ordre des boutons
  - Bouton "Étape précédente" → EN HAUT
  - Bouton "Étape suivante" → EN BAS

### 3. 🔄 Step 01 - Expéditeur
- **Fichier**: `components/CreateOrder/SecondStep.tsx`
- **Actions**:
  - Ajouter sélecteur "Expéditeur existant" OU "Nouvel expéditeur"
  - Ajouter champ "Remarque" (optionnel)

### 4. 🔄 Step 03 - Colis (4ème option taille)
- **Fichier**: `components/CreateOrder/FirstStep.tsx`
- **Action**: Ajouter option "Valeur précise" pour dimensions/poids exacts

### 5. 🔄 Step 04 - Service (Logo Standard + BM)
- **Fichier**: `components/CreateOrder/FourthStep.tsx`
- **Actions**:
  - Rendre logo "Standard" plus visible
  - Ajuster calcul selon "BM" (à clarifier avec backend)

### 6. 🔄 Step 05 - Récapitulatif
- **Fichier**: `components/CreateOrder/FifthStep.tsx` ou `app/(client)/orders/recap.tsx`
- **Actions**:
  - Réduire espaces vides
  - Déplacer "Montant facultatif" et "Remarque" EN HAUT
  - Renommer bouton "Paiement" → "Confirmation"
  - Placer bouton EN BAS

### 7. 🔄 Historique - Statut "Compte réglé" + Filtre date
- **Fichier**: `app/(client)/orders/index.tsx`
- **Actions**:
  - Ajouter statut `SETTLED` ("Compte réglé")
  - Ajouter filtre par date (DatePicker)

### 8. 🔄 Section Profil → "Statut de suivi des comptes"
- **Fichier**: `app/(client)/profile.tsx`
- **Actions**:
  - Renommer section "Mon Profil" → "Statut de suivi des comptes"
  - Afficher montant à remettre au client
  - Afficher statut "Argent remis" + moyen de paiement
  - Sync avec Admin et App Livreur

---

## MODULE LIVREUR - Workflow détaillé

### 1. 🔄 Workflow livraison (4 étapes explicites)
- **Fichier**: `app/(courier)/orders/[id].tsx` (lignes 215-234)
- **Actions**:
  - Remplacer actions génériques par 4 étapes:
    1. **En chemin pour récupération** (vers expéditeur)
    2. **Récupéré** (colis pris en charge)
    3. **En chemin pour livraison** (vers destinataire)
    4. **Livré** (mission terminée)

### 2. ✅ Fonctionnalités financières
- **Fichiers**: 
  - `app/(courier)/evening-settlement.tsx` ✅ DÉJÀ IMPLÉMENTÉ
  - `app/(courier)/dispatches.tsx` (à vérifier)
- **Status**: Confirmation bidirectionnelle et gestion argent clients déjà présents

---

## Priorités d'implémentation

### 🔴 Priorité HAUTE (Bloquants UX)
1. Validation téléphone 030
2. Navigation boutons création commande
3. Workflow livreur 4 étapes

### 🟡 Priorité MOYENNE (Améliorations importantes)
4. Step 01 - Sélecteur expéditeur + remarque
5. Step 05 - Réorganisation récap
6. Historique - Statut "Compte réglé" + filtre date

### 🟢 Priorité BASSE (Nice to have)
7. Step 03 - 4ème option taille
8. Step 04 - Logo Standard + BM
9. Section Profil - Renommage + montants

---

## Notes techniques

- **BM**: À clarifier avec le backend (probablement "Bénéfice Marge" ou "Base Montant")
- **Sync Admin/Livreur/Client**: Utiliser les hooks existants (`useAdminStats`, `useCourierEveningSettlement`, etc.)
- **Validation téléphone**: Mettre à jour aussi dans `app/(auth)/login.tsx` et autres composants d'auth
