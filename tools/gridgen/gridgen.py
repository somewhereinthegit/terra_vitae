import pandas as pd
import numpy as np
import random


def load_data(csv_file, biome_num):
    """Charge le fichier CSV et filtre les données en fonction du biome spécifié."""
    df = pd.read_csv(csv_file, delimiter='\t')  # Supposons que le fichier est tabulé
    df = df[df['Biome'] == biome_num]

    # Extraction des informations utiles
    terrains = df[['Terrain', 'Distribution', 'Limitrophes']].set_index('Terrain')

    # Transformation des distributions et voisinages
    for terrain in terrains.index:
        # Convertir la distribution en probabilité
        terrains.at[terrain, 'Distribution'] = int(terrains.at[terrain, 'Distribution'])

        # Convertir les voisinages en dictionnaire de probabilités
        limitrophes = terrains.at[terrain, 'Limitrophes']
        voisinages = {}
        for pair in limitrophes.split(', '):
            t, p = pair.split(' (')
            voisinages[int(t)] = int(p.strip('%)'))
        terrains.at[terrain, 'Limitrophes'] = voisinages

    return terrains


def get_most_frequent_neighbor(grid, x, y, terrain_choices):
    """Renvoie le type de terrain le plus fréquent parmi les voisins immédiats."""
    neighbors = []
    if x > 0:
        neighbors.append(grid[y, x - 1])  # Voisin gauche
    if y > 0:
        neighbors.append(grid[y - 1, x])  # Voisin du haut

    if neighbors:
        most_common = max(set(neighbors), key=neighbors.count)  # Terrain le plus fréquent
        return most_common
    return random.choice(terrain_choices)


def generate_grid(width, height, terrains):
    """Génère une grille de jeu avec les terrains répartis de manière cohérente."""
    grid = np.zeros((height, width), dtype=int)

    # Déterminer la répartition initiale des terrains
    total_weight = sum(terrains['Distribution'])
    terrain_choices = list(terrains.index)
    terrain_probs = [terrains.at[t, 'Distribution'] / total_weight for t in terrain_choices]

    # Initialiser la première case aléatoirement
    grid[0, 0] = np.random.choice(terrain_choices, p=terrain_probs)

    for y in range(height):
        for x in range(width):
            if x == 0 and y == 0:
                continue  # Première case déjà remplie

            preferred_terrain = get_most_frequent_neighbor(grid, x, y, terrain_choices)
            voisins = []
            if x > 0:
                voisins.append(grid[y, x - 1])  # Voisin gauche
            if y > 0:
                voisins.append(grid[y - 1, x])  # Voisin du haut

            if voisins:
                # Calcul des probabilités en fonction des voisins
                voisin_counts = {t: 0 for t in terrain_choices}
                for v in voisins:
                    for t, p in terrains.at[v, 'Limitrophes'].items():
                        voisin_counts[t] += p

                total = sum(voisin_counts.values())
                if total > 0:
                    terrain_probs = [voisin_counts[t] / total for t in terrain_choices]
                else:
                    terrain_probs = [1 / len(terrain_choices)] * len(terrain_choices)
            else:
                terrain_probs = [terrains.at[t, 'Distribution'] / total_weight for t in terrain_choices]

            # Favoriser le terrain le plus fréquent
            if random.random() < 0.6:  # 60% de chance de suivre la tendance locale
                grid[y, x] = preferred_terrain
            else:
                grid[y, x] = np.random.choice(terrain_choices, p=terrain_probs)

    return grid


def display_grid(grid):
    """Affiche la grille sous forme de tableau."""
    df_grid = pd.DataFrame(grid)
    print(df_grid.to_string(index=False, header=False))  # Affichage sans index ni en-tête


def display_gridJS(grid):
    """Affiche la grille sous forme de déclaration JS."""
    js_grid = "const grid = [\n"
    js_grid += "\n".join(["  [" + ", ".join(map(str, row)) + "]," for row in grid])
    js_grid += "\n];"
    print(js_grid)

if __name__ == "__main__":
    csv_file = "Terra Vitae - Terrains.tsv"  # Nom du fichier CSV
    biome_num = 1  # Numéro du biome (ex: Désert = 1)
    width, height = 12, 12  # Dimensions de la grille

    terrains = load_data(csv_file, biome_num)
    grid = generate_grid(width, height, terrains)
    display_grid(grid)
    display_gridJS(grid)
