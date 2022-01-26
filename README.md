# APoD Viewer

NASA's [Astronomy Picture of the Day](https://apod.nasa.gov/apod/) combines high 
quality space photography with scientific explanations for each photo. It's an excellent
resource for learning--and a great way to discover new wallpapers. 

However, the NASA site is a bit antiquated by today's standards: its design is
stuck two or three decades in the past, and most importantly, it's impossible to view 
APoDs for more than one day (without resorting to viewing each on its own page). This 
makes for a frustrating user experience. 

The APoD Viewer app solves these problems by implementing a modern design (mobile friendly)
and by displaying multiple APoDs via small cards that a user specifies (by entering a date range).

Visit the site at apod-viewer.com

## Installation and tests

Before proceeding, make sure to first install the backend server (following the installation directions
from that project) and start that server on localhost port 8081. Note, the client is hard-coded
to proxy all api requests to the backend server running on port 8081, so make sure that port is
available. 

To run the tests, either clone the repo or download and unzip the project, making sure to rename the folder
to APoD-Viewer. Then run 'npm install' from the main directory to download the necessary 
dependecies. 

Next, run 'npm start' in the main directory to start the client, making sure to run it on
port 8080. 

Once both the client and server are running, you can run the end-to-end tests via cypress by 
entering 'npm run e2e-test' inside the project directory and selecting apod_viewer.spec.js inside
the newly opened window. 'npm test' runs the unit and integration test suites 
(after the initial run, press a to run all tests).

### A quick note on failing tests (false negatives)

Sometimes Cypress end-to-end tests will report false negatives. For example, the tests
may fail with messages about cy.wait timing out (by default, Cypress waits 5000ms before
timing out). This isn't a problem with the app but a problem with the NASA APoD api, which
can be flaky at times.

Most often, simply running the tests again will cause them to pass. If the tests keep failing
though, try visiting [the APoD api demo endpoint](https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY)
to see if NASA's api is running (it'll return json if so). 

There have been times in the past where the api has been down for several hours to a day, so you
may just have to try again at a later date if it's down. 

Finally, the integration and unit tests will always pass. The errors you may see are console.error
messages I left for debugging purposes (errors are purposely thrown in the tests).

### A quick note about site errors 

If the site doesn't automatically load today's APoD image and is displaying an error message
in the card section, then it's for the same reason as outlined above for failing tests. If the
NASA api is unavailable, the app will not be able to function properly. As mentioned above, verify the
NASA api is working. If it's not, you will have to wait until it's back up for the app
to work properly. 

