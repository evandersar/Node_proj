{//FORM VALIDATION
		var inputs = document.getElementsByTagName('input');
		var spans = document.querySelectorAll('#form_inputs span');
	    var name1 = inputs[0], mail = inputs[1] , subject = inputs[2];
	    var message = document.getElementById('message');
	   
	    name1.addEventListener('keyup', function(){
	    	//console.log(name.value);
	    	if(name1.value.search(/[^a-zA-Z ]/)>=0){
	    		spans[0].style.color = 'red';
	    		name1.title="Name field should contain only letters !";
	    	}
	    	else{
	    		spans[0].style.color = 'white';
	    		name1.title="";
	    	}
	    });

	    mail.addEventListener('keyup', function(){
	    	
	    	if(mail.value.search(/[^a-zA-Z0-9_@.]/)>=0){
	    		spans[1].style.color = 'red';
	    		mail.title="Mail field should contain letters, numbers, ., @ and _ !";
	    	}
	    	else{
	    		spans[1].style.color = 'white';
	    		mail.title="";
	    	}
	    });

	    subject.addEventListener('keyup', function(){
	    	
	    	if(subject.value.search(/[^a-zA-Z ]/)>=0){
	    		spans[2].style.color = 'red';
	    		subject.title="Subject field should contain only letters !";
	    	}
	    	else{
	    		spans[2].style.color = 'white';
	    		subject.title="";
	    	}
	    });

	    message.addEventListener('keyup', function(){
	    	//console.log(name.value);
	    	if(message.value.search(/^.{0,19}$/)>=0){
	    		spans[3].style.color = 'red';
	    		name1.title="Name field should contain only letters !";
	    	}
	    	else{
	    		spans[3].style.color = 'white';
	    		message.title="";
	    	}
	    });
}