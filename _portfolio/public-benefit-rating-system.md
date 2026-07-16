---
title: Public Benefit Rating System
summary: An ArcPy scoring tool that evaluates parcels against Kittitas County's Public Benefit Rating System criteria (KCC 3.46.090).
images:
  - /assets/images/pbrs-map-1.jpg
  - /assets/images/pbrs-map-2.jpg
  - /assets/images/pbrs-map-3.jpg
  - /assets/images/pbrs-map-4.jpg
  - /assets/images/pbrs-map-5.jpg
---

## Scoring Script

```python
import arcpy  # import all needed modules for GIS, GIS environments and operating system
from arcpy import env
import os
input_parcels = arcpy.GetParameterAsText(0) # The input should be a string of parcel numbers to assess,
# separated by comma

scratch = r"G:\Dusty's_Work\PBRSTool\Scratch.gdb"   #workspace for scratch files
env.overwriteOutput = True # overwrite existing outputs. This keeps database from getting too big
env.workspace = r"C:\Users\dusty.pilkington\AppData\Roaming\ESRI\Desktop10.5\ArcCatalog\Connection to GIS-Host.sde"
# Connect to SDE

Tax_Parcels = r"KCsde.DBO.TaxParcel" # Identify input Tax Parcels layer on SDE
Merged_Amenities = r"G:\Dusty's_Work\PBRSTool\DissolvedAmenities.gdb\AmenitiesMerge" # geodatabase with feature class of amenities to score

Histfc = r"G:\Dusty's_Work\PBRSTool\Amenities.gdb\DAHP" # geodatabase with Archeological Resources from DAHP

arcpy.MakeFeatureLayer_management(Tax_Parcels,"Parcels") # Make Feature Layer for Selection
split = input_parcels.split(",") # split input parcels list

for parcel in split:
    selection = arcpy.SelectLayerByAttribute_management("Parcels","ADD_TO_SELECTION","t2_parcelNumber = " + parcel)

arcpy.FeatureClassToFeatureClass_conversion(selection,scratch,"Selected_Parcels") # Create Feature Class for analysis
env.workspace = scratch # set workspace to location of "Selected Parcels"
Parcelselect = "Selected_Parcels"
outputgdb = env.workspace # Set output location

fieldslist = arcpy.ListFields(Parcelselect) # create list of fields in "Selected Parcels"
for f in fieldslist: # Remove field name from list of fields
    fieldname = f.name
    if fieldname == "t2_parcelNumber":
        fieldslist.remove(f)

for field in fieldslist: # delete all unnecessary fields
    printname = field.name
    if  field.required == True:
        print("Can't delete {0}".format(printname))
    else:
        arcpy.DeleteField_management(Parcelselect,field.name)

datafile = arcpy.TabulateIntersection_analysis(Parcelselect,"t2_parcelNumber",Merged_Amenities,os.path.join(scratch,
                                                                "AreaTable"),"Amenity","Shape_Area","","Acres")

# Get Area of intersection between amenities and each parcel
arcpy.MakeFeatureLayer_management(Histfc,"Historic") # Make Feature Layer of Historic Properties point file
arcpy.MakeFeatureLayer_management(Parcelselect,"Parcels_Spatial") # Make Feature Layer for Spatial Join
arcpy.SpatialJoin_analysis("Parcels_Spatial","Historic",os.path.join(scratch,"Parcels_SJ"))# Spatially join
# archeological resources point file to Feature Layer

join = arcpy.JoinField_management(datafile,"t2_parcelNumber","Parcels_SJ","t2_parcelNumber",["t2_parcelNumber","Join_Count"])

addfieldslist = ["Historic_Count","Shorelines_Score","PHS_Score","MajorL_Score","Special_Plant_Score","Wetland_Score",
                 "Flood_Score","Geo_Score","Scenic_Score"]

for item in addfieldslist:
    arcpy.AddField_management(datafile,item,"FLOAT")

calc_fields = ("t2_parcelNumber","Amenity","Shape_Area","AREA","PERCENTAGE","Join_Count","Historic_Count",
               "Shorelines_Score","PHS_Score","MajorL_Score","Scenic_Score","Special_Plant_Score",
                                "Geo_Score","Flood_Score","Wetland_Score")

with arcpy.da.UpdateCursor(datafile,calc_fields) as cursor:
    for row in cursor: # Calculate score for each amenity pursuant to  KCC 3.46.090
        if row[5] > 0:
            row[6] = 3

        elif row[1] == "Shorelines":
            if row[4]  >= 25:
                row[7] = 3
            elif 25 > row[4] >= 15:
                row[7] = 2
            elif 15 > row[4] > 0:
                row[7] = 1
            else:
                row[4] = 0
        elif row[1] == "Priority Habitat":
            if row[4]  >= 50:
                row[8] = 3
            elif 50 > row[4] > 0:
                row[8] = 2
            else:
                row[8] = 0
        elif row[1] == "Major Lakes/Rivers":
            if row[3] <= 1:
                row[9] = 1
            if row[3] > 1:
                if row[4]  >= 50:
                    row[9] = 3
                elif 50 > row[4] > 0:
                    row[9] = 2
                else:
                    row[9] = 0
        elif row[1] == "Viewshed":
            if row[3] >= 40:
                row[10] = 2
            else:
                row[10]  = 0
        elif row[1] == "Special Plant Sites":
            if row[3] > 10:
                if row[4] >= 50:
                    row[11] = 3
                elif 50 > row[4] > 0:
                    row[11] = 1
                else:
                    row[11] = 0
        elif row[1] == "Geologic Hazards":
            if row[4] >= 50:
                row[12] = 2
            elif 50 > row[4] > 0:
                row[12] = 1
            else:
                row[12] = 0
        elif row[1] == "Floodplains/Ways":
            if row[4] >= 50:
                row[13] = 3
            elif  50 > row[4] > 0:
                row[13] = 2
            else:
                row[13]= 0
        elif row[1] == "Wetlands":
            if row[4] >= 50:
                row[14] = 3
            elif 50 > row[4]  > 0:
                row[14] = 2
            else:
                row[14] = 0
        cursor.updateRow(row)

statsfields = [["Historic_Count","SUM"],["Shorelines_Score", "SUM"],["PHS_Score","SUM"],["MajorL_Score","SUM"],
["Scenic_Score","SUM"],["Special_Plant_Score","SUM"],["Geo_Score","SUM"],["Flood_Score","SUM"],["Wetland_Score","SUM"]]

# Generate list of fields to add all scores, create table of statistics
statstable= arcpy.Statistics_analysis(datafile,"Score_Sums",statsfields,"t2_parcelNumber")
# calculate score from Historic Properties

arcpy.AddField_management(statstable,"Historic_Score","INTEGER")

Histfields = ("SUM_Historic_Count","Historic_Score")

with arcpy.da.UpdateCursor(statstable,Histfields) as histcursor:
    for v in histcursor:
        if v[0] > 0:
            v[1] = 3
        else:
            v[1] = 0
        histcursor.updateRow(v)
# join Statistics table to Parcels

join = arcpy.AddJoin_management("Parcels","t2_parcelNumber",statstable,"t2_parcelNumber","KEEP_COMMON")
#Output feature class joined to statistics table

finaloutput = arcpy.FeatureClassToFeatureClass_conversion(join,outputgdb,"Final_fc")

arcpy.AddField_management(finaloutput,"Final_Score","INTEGER")

outfields = ("Score_Sums_SUM_Shorelines_Score","Score_Sums_SUM_PHS_Score","Score_Sums_SUM_MajorL_Score",
                 "Score_Sums_SUM_Scenic_Score","Score_Sums_SUM_Special_Plant_Score",
                 "Score_Sums_SUM_Geo_Score","Score_Sums_SUM_Flood_Score","Score_Sums_SUM_Wetland_Score",
                 "Score_Sums_Historic_Score","Final_Score")

# Convert Null Values to Zeroes

with arcpy.da.UpdateCursor(finaloutput,outfields) as c:
    for i in c:
        if i[0] == None:
            i[0] = 0
        if i[1] == None:
            i[1] = 0
        if i[1] == None:
            i[1] = 0
        if i[2] == None:
            i[2] = 0
        if i[3] == None:
            i[3] = 0
        if i[4] == None:
            i[4] = 0
        if i[5] == None:
            i[5] = 0
        if i[6] == None:
            i[6] = 0
        if i[7] == None:
            i[7] = 0
        if i[8] == None:
            i[8] = 0

#Sum all points to generate final score
        c.updateRow(i)
        totallist = [i[0],i[1],i[2],i[3],i[4],i[5],i[6],i[7],i[8]]
        total = sum(totallist)
        i[9] = total
        c.updateRow(i)
#Create excel spreadsheet with totals to send to Assessor

outputtv = arcpy.MakeTableView_management(finaloutput,"output_view")

arcpy.TableToExcel_conversion(outputtv,r"G:\Dusty's_Work\PBRSTool\Excel_Output\PBRS_Sheet.xls")

#finaloutput can now be used for Data Driven Pages process to map amenities
```
