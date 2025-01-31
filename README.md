# Top Spofity Songs 2023 Exploration

## Background Overview
This dataset was taken off of [Kaggle](https://www.kaggle.com/datasets/nelgiriyewithana/top-spotify-songs-2023).
I wanted to explore and find out what makes a song a good song, and what makes a song a top chart song.

## Data Structure Overview
The data used is a single CSV taken from Kaggle. The CSV initially contained the following columns and data types:
![image](https://github.com/user-attachments/assets/0de8d35e-13ea-46d8-be21-0ac885624e5e)

The data initially contained many missing values, incorrect data types, and data typos / misinputs. The process to clean these is seen in the notebook.

## Executive Summary

At a general glance, we can see what the common qualities of songs look like in the dataset. We can see that songs that are not acoustic, tend to be danceable and have lots of energy. Danceability, energy, and valance all are heavily correlated, 
but at a high level, we can see that these barely have any total effect on # of streams, placements in playlists, and chart #.  

![image](https://github.com/user-attachments/assets/f77bfc21-126a-4be8-a52d-a79b9ec7c52e)

## Further Insights

### Release month and day
- Beginning of summer we can see that there was a jump in acoustic songs released.
  - - ![image](https://github.com/user-attachments/assets/21937a98-4dd9-45ef-9f7b-c2bbb34b0729)
- Songs released on the 1st of the month tended to do better in streams and playlist placement.
  - - ![image](https://github.com/user-attachments/assets/dd3b1c51-6736-4f37-aedc-ba09c5a52d2e)

### Effects of less energetic songs
- We can see more clearly the relationship between energy % and acoustic % on the parallel coordinate plot
  - -![image](https://github.com/user-attachments/assets/dbddc2f7-0128-447b-87c4-0bc7ad9ef3f2)
 
- But we can see that more songs that are higher on the streams are not that acoustic and are more energetic, slightly, however.
  - - ![image](https://github.com/user-attachments/assets/368910d9-66eb-4534-8ced-ca1ec0367d81)
  

## Recommendations:
-  Based on the data and visualizations, we can say that there is no "formula" to creating a top chart song (such as maximizing energy and minimizing acousticness while keeping it in a certain key)
-  I Suggest recording additional types of data, such as catchiness, and song description (what the song is about, love, hate, story, empowering, political, etc).
-  It may be useful to record chart history, and other chart statistics like levels on weekly charts, daily charts, monthly charts, etc, so that we can observe any possible seasonal patterns in listening activity.
