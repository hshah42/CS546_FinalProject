(
    function($) 
    {
        let commentForm = $("#commentBox");
        let comment = $("#userComment");
        let commentDiv = $("#comments");

        let registerForm = $("#registerButton");
		//let buttonIdW = $("#registerWithdrawButton");
		//let buttonIdR = $("#registerSubmitButton");
        let eventIdField = $("#eventId");
		
		//let withdrawForm = $("#registerWithdrawButton");
		//let userNameField = $("#userName");
		
		let registeredStatus = $("#registered");
		//let Registered = false;
		
		
		
		
		//console.log(registeredStatus);
		
		if(registeredStatus.val() === "true")
		{
			let div = document.createElement("button");
            div.classList.add("btn");
            div.classList.add("btn-outline-danger");
            div.classList.add("btn-lg");
            div.type = "submit";
            div.id = "registerWithdrawButton";
            div.innerHTML = "Withdraw";
			//Registered = true;
			this.currButton = "registerWithdrawButton";

			document.getElementById("registerSubmitButton").replaceWith(div);
		}
		
        registerForm.submit(function(event)
        {
            event.preventDefault();

            let type = this.id;
            let eventId = eventIdField.val();
			//let userName = userNameField.val();
			
			//alert(type);

            if(type === "registerButton")
            {
                let requestConfig = {
                    method : "POST",
                    url : "/registerWithdraw",
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
						//this.currButton = "registerWithdrawButton";

                        document.getElementById("registerSubmitButton").replaceWith(div);
                    }
					else
                    {
                        $('#successModal').modal("show")

                        let div = document.createElement("button");
                        div.classList.add("btn");
                        div.classList.add("btn-outline-success");
                        div.classList.add("btn-lg");
                        div.type = "submit";
                        div.id = "registerSubmitButton";
                        div.innerHTML = "Register";
						//this.currButton = "registerWithdrawButton";

                        document.getElementById("registerWithdrawButton").replaceWith(div);
                    }
                });
            }
			
			
        });

        commentForm.submit(function(event)
        {
            event.preventDefault();
				
			console.log(comment);
			
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