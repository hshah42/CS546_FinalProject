(
    function($) 
    {
        let commentForm = $("#commentBox");
        let comment = $("#userComment");
        let commentDiv = $("#comments");

        let registerForm = $("#registerButton");
        let eventIdField = $("#eventId");

        registerForm.submit(function(event)
        {
            event.preventDefault();

            let type = this.id;
            let eventId = eventIdField.val();

            if(type === "registerButton")
            {
                let requestConfig = {
                    method : "POST",
                    url : "/register",
                    content : "application/json",
                    data : {
                            "eventId" : eventId
                        }
                };

                $.ajax(requestConfig).then(function(response)
                {
                    if(response.stat === "registered")
                    {
                        $('#successModal').modal("show")

                        let div = document.createElement("button");
                        div.classList.add("btn");
                        div.classList.add("btn-outline-danger");
                        div.classList.add("btn-lg");
                        div.type = "submit";
                        div.id = "registerWithdrawButton";
                        div.innerHTML = "Withdraw";

                        document.getElementById("registerSubmitButton").replaceWith(div);
                    }
                });
            }
        });

        commentForm.submit(function(event)
        {
            event.preventDefault();

            let commentValue = comment.val();
            const urlParams = new URLSearchParams(window.location.search);
            
            if(commentValue)
            {
                let requestConfig = {
                    method : "POST",
                    url : "/addComment",
                    content : "application/json",
                    data : {
                            "comment" : commentValue,
                            "eventId" : urlParams.get('id')
                        }
                };

                $.ajax(requestConfig).then(function(response)
                {                    
                    if(response.commentAdded === "true")
                    {
                        let div = document.createElement("div");
                        div.classList.add("card");
                        
                        let cardHeader = document.createElement("div");
                        cardHeader.classList.add("card-header");
                        cardHeader.style.fontWeight = "bold";
                        
                        let userName = document.createTextNode(response.username);
                        cardHeader.appendChild(userName);
                        
                        div.appendChild(cardHeader);

                        let cardBody = document.createElement("div");
                        cardBody.classList.add("card-body");                        
                        
                        let commentForBody = document.createElement("p");
                        commentForBody.classList.add("card-text");

                        let commentForBodyText = document.createTextNode(response.comment);
                        commentForBody.appendChild(commentForBodyText);

                        cardBody.appendChild(commentForBody);
                        div.appendChild(cardBody);

                        commentDiv.append(div);
                        commentDiv.append(document.createElement("br"));
                    }
                });
            }
        });
    }
)(window.jQuery);