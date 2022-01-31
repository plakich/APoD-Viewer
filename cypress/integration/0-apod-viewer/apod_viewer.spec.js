describe("APoD Viewer", () => 
{
    it("loads successfully", () => 
    {
        cy.visit("http://localhost:8080");

        // Hero Section 

        cy.get("header")
            .should("be.visible")
            .within(() => 
            {
                cy.get("p")
                    .should("contain.text","APoD Viewer");
            });

        cy.get("h1").should("contain.text","Astronomy Picture of the Day Viewer");

        // DatePicker Component 
        cy.get("form")
            .should("be.visible")
            .within(() =>
            {
                cy.contains("label", /start date/i)
                    .invoke("attr", "for")
                    .should("equal", "fromDate")
                    .then((id) => 
                    {
                        // note that the last Cypress command inside the `cy.then`
                        // changes the yielded subject to its result 
                        // (i.e., here it's the input itself)
                        cy.get('#' + id)
                    })
                    .should("have.attr", "name", "fromDate");
                
                cy.contains("label", /end date/i)
                    .invoke("attr", "for")
                    .should("equal", "toDate")
                    .then((id) => 
                    {
                        cy.get('#' + id)
                    })
                    .should("have.attr", "name", "toDate");

                // Submit button
                cy.get("button")
                    .should("contain.text", "Submit")
                    .should("not.be.disabled");

            });
        
        // Loading spinner 
        cy.get("[data-testid='loading']").should("be.visible");
        
        // Only one card shown when page loads
        // with todays APoD
        cy.get(".card").should("have.length", 1)
            .within(() =>
            {
                // format all APoD cards display date in (i.e., YYYY-MM-DD )
                const todaysDate = new Date().toLocaleDateString("en-CA"); 

                cy.get("h2 > time")
                    .should("have.attr", "datetime")
                    .and("equal", todaysDate);
            });
              
    });

    it("displays APoDs for entered date range", () =>
    {
        cy.intercept("POST", "/api").as("api");

        cy.get("form").within(() => 
        {
            
            // get 30 days of APoDs, start and end dates inclusive
            cy.get("input[name='fromDate']").type("2021/10/01");
            cy.get("input[name='toDate']").clear().type("2021/10/30");

            cy.root().submit();
        });
        
        cy.wait("@api").then(() =>
        {
            // Could just do assertions on the
            // body of res here. However, we want
            // to accurately assert elements show up
            // on the page, so we'll test it as if 
            // we're an actual user seeing the results
            // of the response.

            cy.get(".card")
                .should("have.length", 30)
                .and("be.visible"); 

            // check that all 30 cards have the correct dates
            cy.get(".card").each((card, i) =>
            {
                cy.wrap(card)
                    .find("h2 > time")
                    .should("have.attr", "datetime")
                    // Count down from 30, adding a zero
                    // to the day when only a single digit.
                    // (dates displayed in reverse chronological
                    // order, hence the counting down)
                    .and("equal", `2021-10-${ (30 - i) > 9 ? 30 - i : "0" + (30 -i) }`);
            });

        });
    });

    it(`loads more APoDs after scrolling to the bottom of the page
        after entering date range with more than 30 days`, () =>
    {
        cy.intercept("POST", "/api").as("api");

        cy.get("form").within(() => 
        {
            
            // get 61 days worth of APoDs
            cy.get("input[name='fromDate']").clear().type("2021/08/31");
            cy.get("input[name='toDate']").clear().type("2021/10/30");

            cy.root().submit();
        });

        cy.wait("@api").then((interception) => 
        {
            assert.isNotNull(interception.response.body, "1st API call has data");

            // api only sends 30 apods at once,
            // so this num changes on subsequent reqs
            cy.get(".card")
                .should("have.length", 30)
                .and("be.visible"); 

            // check that all 30 cards have the correct dates
            cy.get(".card").each((card, i) =>
            {
                cy.wrap(card)
                    .find("h2 > time")
                    .should("have.attr", "datetime")
                    // Count down from Oct 30, adding a zero
                    // to the day when only a single digit.
                    // (dates displayed in reverse chronological
                    // order, hence the counting down)
                    .and("equal", `2021-10-${ (30 - i) > 9 ? 30 - i : "0" + (30 -i) }`);
            });

            // load 30 more cards by scrolling to the bottom
            // (our api endpoint only sends back 30 apods
            //  at most at one time)
            cy.scrollTo("bottom");
        });

        cy.wait("@api").then((interception) => 
        {
            assert.isNotNull(interception.response.body, "2nd API call has data");

            cy.get(".card")
                .should("have.length", 60)
                .and("be.visible"); 

            // now just check that first and last cards 
            // are correct dates
            cy.get(".card-container > div:first-child")
                .find("h2 > time")
                .should("have.attr", "datetime")
                .and("equal", "2021-10-30");
            
            cy.get(".card-container > div:last-child")
                .find("h2 > time")
                .should("have.attr", "datetime")
                .and("equal", "2021-09-01");

            
            // Sometimes, the last-child selector selects 
            // the wrong card (second to the last), unless
            // we do the should check for length first. 
            // It's an odd bug, but even without the length 
            // check, the below always returns the current last 
            // card. 
            // cy.get(".card-container > div:nth-of-type(60)")
            //     .find("h2 > time")
            //     .should("have.attr", "datetime")
            //     .and("equal", "2021-09-01");

            // load last APoD
            cy.scrollTo("bottom");
        });

        cy.wait("@api").then((interception) => 
        {
            assert.isNotNull(interception.response.body, "3rd API call has data");

            cy.get(".card")
                .should("have.length", 61)
                .and("be.visible");

            // last test proved the previous dateRange,
            // plus the new one was present. So now
            // we just check last card has correct date.
            cy.get(".card-container > div:last-child")
                .find("h2 > time")
                .should("have.attr", "datetime")
                .and("equal", "2021-08-31");

            // cy.get(".card-container > div:nth-of-type(61)")
            //     .find("h2 > time")
            //     .should("have.attr", "datetime")
            //     .and("equal", "2021-08-31"); 
            
        }); 

    });

    describe("mobile view collasping card descriptions", () =>
    {
        beforeEach(() => 
        {
            // Anything below 780 only displays one card
            // with a collasped description. 
            cy.viewport(779, 500); 

        });

        it("has cards with collasped descriptions and arrows to show descriptions", () =>
        {

            // We don't need another api call here, but
            // the tests will be slower if we're still 
            // running all this on the 61 cards left from
            // the last test. 
            cy.intercept("POST", "/api").as("api");

            cy.get("form").within(() => 
            {
                // get just 10 days of apods 
                cy.get("input[name='fromDate']").clear().type("2021/10/21");
                cy.get("input[name='toDate']").clear().type("2021/10/30");
    
                cy.root().submit();
            });

            cy.wait("@api").then((interception) => 
            {
                assert.isNotNull(interception.response.body, "4th API call has data");

                // not needed, but this is
                // the only way you'll see the
                // cards if watching the testing 
                // window.
                cy.scrollTo("bottom"); 

                // check that all 10 cards have arrow and 
                // correct accessible attributes and values.
                cy.get(".card").each((card) =>
                {
                    cy.wrap(card)
                        .find(".card__btn")
                        .should("be.visible")
                        .should("not.have.class", "show-desc")
                        .should("have.attr", "aria-expanded")
                        .and("equal", "false");
                    
                    cy.wrap(card)
                        .find(".card__desc")
                        .should("not.have.class", "show-desc")
                        .and("not.be.visible"); 
                });
                
            }); 
            
        });

        it("removes/adds arrow to expand description on change between desktop/mobile view", () =>
        {
            cy.viewport(780, 500); // desktop starts at 780px

            // check cards have removed arrow on desktop view
            cy.get(".card").each((card) =>
            {
                cy.wrap(card)
                    .find(".card__btn")
                    .should("not.exist");
                
                // show-desc is mobile only with
                // mobile specific styles. Card desc
                // still show on desktop.
                cy.wrap(card)
                    .find(".card__desc")
                    .should("not.have.class", "show-desc") 
                    .and("be.visible"); 
            });


           cy.viewport(779, 500); // change back to mobile view

           // check that all 10 cards have arrow and 
           // and values (aria-expanded, show-desc) were
           // reset.
            cy.get(".card").each((card) =>
            {
                cy.wrap(card)
                    .find(".card__btn")
                    .should("be.visible")
                    .should("not.have.class", "show-desc")
                    .should("have.attr", "aria-expanded")
                    .and("equal", "false");
                
                cy.wrap(card)
                    .find(".card__desc")
                    .should("not.have.class", "show-desc")
                    .and("not.be.visible"); 
            });
        });

        it("shows description for apod after clicking button to expand description", () =>
        {
            cy.get(".card__btn").each((cardBtn) =>
            {
                cy.wrap(cardBtn)
                    .click()
                    // use should with callback so
                    // we don't change subject 
                    // yielded.
                    .should((cardBtn) =>
                    {
                        expect(cardBtn)
                            .to.have.attr("aria-expanded", "true"); 
                    })
                    .parentsUntil(".card-container")
                    .find(".card__desc")
                    .should("be.visible"); 
            });
               
        });
    });

    describe("fixed-header", () => 
    {
        context("desktop/tablet view", () => 
        {
            beforeEach(() => 
            {
                // We consider desktop/tablet view 
                // to be anything over 780px in width.
                // The 300px height here is just to 
                // make sure the fixed-header is shown,
                // which is only when the window is 
                // scrolled past the hero section.
                cy.viewport(780, 300);

                // scrollTo bottom again because changing viewport
                // can set view back to top
                cy.scrollTo("bottom");
            });
      
            it("displays fixed-header without a toggle btn for mobile menu", () => 
            {
                // display datepicker form itself on desktop view
                cy.get(".header-fixed > .form-container").should("be.visible");
                // but don't display hamburger toggle
                cy.get(".header-fixed > .hamburger-toggle").should("not.exist");
            });

            it("displays apods for date range entered on fixed-header form", () =>
            {

                cy.intercept("POST", "/api").as("api");

                cy.get(".header-fixed form").within(() => 
                {
                    
                    // get 10 days worth of APoDs to check form on header works
                    cy.get("input[name='fromDate']").clear().type("2021/09/21");
                    cy.get("input[name='toDate']").clear().type("2021/09/30");
        
                    cy.root().submit();
                });

                cy.wait("@api").then((interception) => 
                {
                    assert.isNotNull(interception.response.body, "5th API call has data");

                    // not needed, but this is
                    // the only way you'll see the
                    // cards if watching the testing 
                    // window.
                    cy.scrollTo("bottom"); 
    
                    cy.get(".card")
                        .should("have.length", 10)
                        .and("be.visible"); 
        
                });
        
            });
        });
      
        context("mobile view", () => 
        {
            beforeEach(() => 
            {
                // run these tests as if in a mobile browser
                // and ensure our responsive UI is correct,
                // 779px being our cutoff for mobile views.
                cy.viewport(779, 600);

                // scrollTo bottom again because changing viewport
                // can set view back to top
                cy.scrollTo("bottom"); 
            })
      
            it("displays mobile menu on click", () => 
            {
                // because the form is now inside mobile menu
                // but only after hamburger toggle
                cy.get(".header-fixed > .form-container").should("not.exist");
                cy.get(".header-fixed > .hamburger-toggle")
                    .should("be.visible")
                    .click();
                
                cy.get(".header-fixed > .mobile-menu").should("be.visible");
                cy.get(".header-fixed > .mobile-menu form").should("be.visible");
            });

            it("displays apods for date range entered inside mobile menu form", () =>
            {
                cy.intercept("POST", "/api").as("api");

                cy.get(".header-fixed > .mobile-menu form").within(() => 
                {
                    
                    // get 10 days worth of APoDs
                    cy.get("input[name='fromDate']").clear().type("2021/08/11");
                    cy.get("input[name='toDate']").clear().type("2021/08/20");
        
                    cy.root().submit();
                });

                cy.wait("@api").then((interception) => 
                {
                    assert.isNotNull(interception.response.body, "6th API call has data");

                    cy.scrollTo("bottom"); 
    
                    cy.get(".card")
                        .should("have.length", 10)
                        .and("be.visible"); 
        
                });
            });
        });
      });

});