---
title: County Demographic Selection Script
summary: An ArcPy script that scores counties by demographic similarity to a reference county and exports the closest matches.
---

This script iterates through county demographic data joined to a county boundaries TIGER/LINE shapefile,
calculates a similarity score across overall demographics, and exports a shapefile of counties within a
defined similarity range.

```python
# This script will iterate through county demographic data that has been joined to a county boundaries TIGER/LINE
# shapefile, calculates a similarity score for total overall demographics for similar counties, and exports a
# shapefile of counties within a define range.

import arcpy
from arcpy import env #import environment module
env.overwriteOutput = True #Overwrite new files
outputfolder =r"J:\Housing\Output"

input_fc = r"J:\Housing\Projected\Counties2016Projected.shp"
query = '"HC03_VC03" >=  38506 AND "HC03_VC03" <= 47063'

arcpy.MakeFeatureLayer_management(input_fc,"Feature_lyr",query)   # make feature layer to work on with population
#within 10% of Kittitas population values
arcpy.CopyFeatures_management("Feature_lyr","J:\Housing\Workfiles\Ten_percent_counties_2016.shp")
env.workspace = "J:\Housing\Workfiles"
pop_10_perclist = arcpy.ListFeatureClasses("*2016*")

pop_10_perc = pop_10_perclist[0]
fields = arcpy.ListFields(pop_10_perc,"HC*")#create list of fields limited to those with *HC

namelist = [] # create list to hold field names
for field in fields: # create list of field names as strings
    name = field.name
    namelist.append(name)

scorelist = [] #create empty list to hold score field names
for i in namelist: # iterate  through field names, create field name with "S" added for "Score"
    x = i[-4:] + "S"
    arcpy.AddField_management("Feature_lyr", x, "FLOAT")
    scorelist.append(x)

comb_fieldslist = namelist + scorelist# combine namelist and scorelist to enter into Update Cursor
arcpy.AddField_management(pop_10_perc,"Sum_EFYTOT")

comb_fieldslist.append("Enroll_S")
comb_fieldslist.append("Sum_EFYTOT")
arcpy.AddField_management(pop_10_perc,"Final","FlOAT")# Add Field for final score

finalfield = arcpy.ListFields(pop_10_perc,"Final")
for final in finalfield: # Add "Final" field to list that will be entered into Update Cursor
    fin_name = final.name
    comb_fieldslist.append(fin_name)

# print scorelist

arcpy.AddField_management(pop_10_perc,"Enroll_S")

fieldslist = arcpy.ListFields(pop_10_perc)

scorelength = len(scorelist) #Count number of fields in scorelist to get average
Kit_Total_population = float(42785)
Kit_Female = float(50)
Kit_age = 33.7
Kit_white = float(89.6)
Kit_black = float(1.1)
Kit_Native = float(0.8)
Kit_Asian = float(1.9)
Kit_Island = float(0.1)
Kit_other = float(3.4)
Kit_hispanic = float(8.5)
Kit_voting_age = float(0.79)
Kit_enrollment = float(17163)

fieldslist = arcpy.ListFields(pop_10_perc)
for n in fieldslist:
    desc = n.name
    print desc
print comb_fieldslist

with arcpy.da.UpdateCursor(pop_10_perc,comb_fieldslist) as cursor: # Calculate similarity scores for every
    # demographic variable
    for row in cursor:
        county_pop = row[0]
        try:
            row[11] = Kit_Total_population/county_pop # population score
        except:
            pass
        county_female = row[1]
        try:
            row[12] = Kit_Female/county_female #female score
        except:
            pass
        county_age = row[2]
        try:
            row[13] = Kit_age/county_age
        except:
            pass
        county_white = row[3]
        try:
            row[14] = Kit_white/county_white
        except:
            pass
        county_black = row[4]
        try:
            row[15] = Kit_black/county_black
        except:
              pass
        county_native =row[5]
        try:
            row[16] = Kit_Native/county_native
        except:
            pass
        county_asian = row[6]
        try:
            row[17] = Kit_Asian/county_asian
        except:
            pass
        county_island = row[7]
        try:
            row[18] = Kit_Island/county_island
        except:
            pass
        county_other = row[8]
        try:
            row[19] = Kit_other/county_other
        except:
            pass
        county_hispanic = row[9]
        try:
                row[20] = Kit_hispanic/county_hispanic
        except:
            pass
        county_voting_age = float(row[10])/float(row[0])
        try:
            row[21] = Kit_voting_age/county_voting_age
        except:
            pass
        countyenroll = float(row[22])
        try:
          row[23] = Kit_enrollment/countyenroll
        except:
            pass
        total = row[11] + row[12] + row[13] + row[14] + row[15] + row[16] + row[17] + row[18] + row[19] + row[20] + \
                row[21] + row[23]
        row[24] = float(total) /float(scorelength)
    cursor.updateRow(row)
#output records for further analysis if they have similarity scores between 0.5 and 1.5.
arcpy.FeatureClassToFeatureClass_conversion(pop_10_perc,outputfolder,"Output_2017.shp",'"Final" <= 1.5 AND "Final"'
                                                                                       ' >=0.5')
```
