# README #

### TO DO - V1 ###

* TG - test replacements and conditionals
* TG - set vis renderheight to .vis height
* TG - set contentTop height to screenheight -90px
* TG - update the "How others responded"

* NT - add a property to customise "How Others esponded"
* NT - mediaqueries to ignore if screen hieght is too big!
* NT - add scales/questions for 4 more pages for info.json
* NT - add mediaqueries for 6 and 6 plus

* TG - conditionals
     - user.scale.value <> aggregate.scale.mean

* TG - replacements
     - aggregate.scale.mean
  
* NT - revise rgbs for greens
* NT - add KP's copy to 1 more page  
* NT - remove vis styles

* TG - Google Analytics
     - integrate GA into page
     - how many views
     - how long
     - what pages do they spend time on

*
### ICE-BOX - V2 ###

* NT - add Openness vs. Neuroticism to example.json as a correlation for scatterplots

* NT - try new lines in labels


* TG - Feedback email form
     - include details of user and page in hidden fields 

* NT - do css for text styles for form insert

* TG - scatterplot
     - grid of dots
     - circle radius = number of users
     - max radius = grid cell size
     - your data point is red

* NT - look at print css

* TG - single page layout for print to PDF

* TG - composite bar chart for cross-tab - openness vs user goal
* TG - 3 overlaid distributions - openness vs user goal


* TG - Investigate Fill text

### DONE ###

* TG - change your dot/line in distribution to just a vertical line labelled 'YOU'
* TG - 270 x 230 aspect ratio drawing and overflow
* TG - use scale min-label + max-label from info.json for distribution and barchart x-axis
* TG - switch off visapp dom writing for lefthand panel
* TG - address classification by index 0,1,2 etc in data-match

* NT - update example.json with fake data for KP pages
* NT - add userGoal tags
* NT - start adding copy from KP
* NT - add Name to example.json as an example replacement text
* TG - bar chart 
     - your data point is a red bar
     - do example with scaleOpen data.
* TG - make distro transparent and filled
* TG - remove right rule bar on distro and bar chart
* TG - make numbering line up with line on distro and bar chart
* TG - add close button to top right
* NT - do css for text styles
* NT - do fixed width page layout for iphone 4, 5 and 6
* TG - replacement text
     - do example of replacement text
* NT - try text replacements
* NT - target a tags to remove jQuery styling
* NT - list KP replacement types
* TG - pie chart labels should use label not value
* TG - add 'how others' to pie
* TG - distribution make 'how others' sentence case, add 1/2 line margin before graph 
* TG - add margin before axis labels on bottom
* TG - add percent and make tighter to edge of graph 
* TG - make distro curve light green fill and dark green outline

* TG - vis tags
    x - pie charts
    x - distirbution
    x - barchar
    x - scales.info out of 10

* TG - replacements
     x - user.question.value
     x - user.scale.value // (same as score?) 
     x - aggregate.scale.classification.value.percentageOfUsers
     x - aggregate.question.value.percentageOfUsers
     x - total of users in a given scale / question

   
     
   - user.scale.classification = x

* TG - pre-process data object
     - aggregate
        - scales
           - distributions number and % of user
           - classifications number and % of user




### NOTES ###

# Text replacement #


- individual:
    - user.question.value
    - user.question.value.label // (same as choice?)
    - user.scale.value // (same as score?) 
    - user.scale.classification.label

- aggregate:
    - aggregate.question.value.percentageOfUsers
    - aggregate.question.mean // (questions with numeric answers only)
    - aggregate.scale.mean
    - aggregate.scale.value.percentageOfUsers
    - aggregate.scale.classification.value.percentageOfUsers
    - aggregate.scale.classification.value.label

- also:
    - total no. of users


# Conditional text #

- show if:
    - user.question.value =  x
    - user.scale.value < aggregate.scale.mean
    - user.scale.value > aggregate.scale.mean


# Google analytics #

Tracking script for the data report

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-30559940-11', 'auto');
  ga('send', 'pageview');

</script>

# vis drawing - queries contentTop to get height

