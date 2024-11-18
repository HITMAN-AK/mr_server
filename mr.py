import pickle
import sys
import pandas as pd
import json
try:
    data = pd.read_csv("df.csv")
    df = pd.DataFrame(data)
except Exception as e:
    print(f"Error loading DataFrame: {e}")
    sys.exit(1)
try:
    with open("sim.pkl", 'rb') as file:
        sim = pickle.load(file)
except Exception as e:
    print(f"Error loading pickle file: {e}")
    sys.exit(1)
def rec(mov):
    l = []
    try:
        index = df[df["Title"] == mov].index[0]
    except IndexError:
        print(f"Movie title '{mov}' not found in DataFrame")
        return []
    
    dis = sorted(list(enumerate(sim[index])), reverse=True, key=lambda x: x[1])
    for i in dis[1:6]:
        l.append(df.iloc[i[0]].Title)
    return l

movie_title = sys.argv[1]
recommendations = rec(movie_title)
print(json.dumps(recommendations))

