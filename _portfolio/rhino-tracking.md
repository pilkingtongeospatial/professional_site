---
title: Rhino Tracking Script
summary: An ArcPy/csv script that builds tracked-movement polylines for individual rhinos from raw GPS observation data.
---

This script generates a shapefile of points/polylines depicting tracked locations of rhinos from a CSV file.

```python
# This script will generate a shapefile of points depicting tracked locations of Rhinos from a csv file
# Author: Dusty Pilkington, MS Candidate, Cultural and Environmental Resource Management, Central Washington
# University

import csv #import necessary modules:  arcpy, csv,
import arcpy
arcpy.env.overwriteOutput = 1 # I want to repeatedly test code, so it is a good idea to overwrite
def rhinoTrackFinder(item,CoordX,CoordY,dictionary): # defines a function to deal with the new rhino every time and
    # append to the dictionary
    if item not in dictionary:
        dictionary[item] = []
    dictionary[item].append((CoordX,CoordY))

trackfile = open("I:\Rhinos\RhinoObservations.csv","r") #points the script to the source csv file
#set workspace, name of output shapefile, spatial reference. Then create new feature class, Add "Rhino" field
# create csvReader and header objects to read csv file.
workspace = "I:\Rhinos"
shapefile = "Rhinos.shp"
sr = arcpy.SpatialReference(4326)
new_fc = arcpy.CreateFeatureclass_management(workspace,shapefile,"POLYLINE","","","",sr)
arcpy.AddField_management(new_fc,"Rhino","TEXT")
csvReader = csv.reader(trackfile)
header = csvReader.next()

# read header in csv
XCoordIndex = header.index("X")
YCoordIndex = header.index("Y")
RhinoIdIndex = header.index("Rhino")

rhinoTrackDictionary = {}  # creates empty dictionary
for row in csvReader: # iterate through the csv, pick up Rhino name, coordinates
    rhino = row[RhinoIdIndex]
    X =row[XCoordIndex]
    Y =row[YCoordIndex]
    rhinoTrackFinder(rhino, X,Y,rhinoTrackDictionary) # call function to append each name and coordinate pair
    # to dictionary
with arcpy.da.InsertCursor(new_fc,("Rhino","SHAPE@")) as cur: # Create cursor object
    for k, v in rhinoTrackDictionary.items(): # Iterate through Dictionary, update "rhino" field, setting variables
        # (k,v) for keys and associated values
        line = arcpy.Polyline(arcpy.Array([arcpy.Point(*coords) for coords in v])) # create array and polyline, iterate
                # through array
        row2 = (k, line) # create variable to pass to insert function, references keys and associated coordinates
        # added to Array
        cur.insertRow(row2) # call insertRow Function with key and line
```
