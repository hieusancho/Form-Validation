
function Validator(options){
    //ham de lay ra the form-group
    function getParent(element ,selector){
        //selector la form-group, element la inputElement
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element=element.parentElement;//trong trg hop ko match vs selector, gán element đó vs element cha và tiếp tục ktra bên trên
        }
    }

    var selectorRules={};
    function validate(inputElement,rule){
        var errorElement=getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);//lay ra selector the span form message
        var errorMessage;

        //lay ra cac rules cua selector
        var rules=selectorRules[rule.selector];

        //lap qua tung rule va kiem tra
        for(var i=0;i<rules.length;i++){
            //trong truong hop input la radio, checkbox,...
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        //lay ra input name=gender
                        formElement.querySelector(rule.selector + ':checked')    
                    );    
                    break;

                default:
                    errorMessage = rules[i](inputElement.value);    
            }

            if(errorMessage) break;
        }

        //errorMessage la Vui long nhap truong nay
        if(errorMessage){
            errorElement.innerText=errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');//them mau do cho form group
        }else{
            errorElement.innerText='';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }
        return !errorMessage;

    }
    //lay element cua form cần validate
    var formElement=document.querySelector(options.form);
    if(formElement){
        //khi submit form
        formElement.onsubmit=function(e){
            e.preventDefault();
            var isFormValid=true;

            //lap qua tung rule va validate(submit button dky ma chua nhap gi no sẽ đỏ hết)
            options.rules.forEach(function (rule){
                var inputElement=formElement.querySelector(rule.selector);
                var isValid=validate(inputElement,rule);

                if(!isValid){
                    isFormValid=false;
                }
            });
          
            //code này để hiện dữ liệu nhập vào form 
            if(isFormValid){
                //truong hop submit vs js
                if(typeof options.onSubmit === 'function'){
                    var enableInputs=formElement.querySelectorAll('[name]:not([disabled])');//disable la ko tuong tac duoc
                    // enableInputs la 1 NodeList
        
                    var formValues=Array.from(enableInputs).reduce(function(values, input){
                       switch(input.type){
                           //radio trả về 1 đối tượng, checkbox trả về 1 array
                            case 'radio':
                                values[input.name]=formElement.querySelector('input[name="' +input.name+'"]:checked').value;
                                break;
                            case 'checkbox':
                                //ktra khi ko check input
                                if(!input.matches(':checked')){
                                    values[input.name]='';
                                    return values;
                                }

                                //ktra co la 1 array ko
                                if(!Array.isArray(values[input.name])){
                                    values[input.name]=[];
                                }
                                values[input.name].push(input.value);
                                break;

                            case 'file':
                                values[input.name]=input.files;//tra ve 1 FileList
                                break;
                            default:
                                values[input.name]=input.value;
                       }
                        return values;
                    }, {});//chuyen NodeList sang Array thi moi sd dc reduce,map,...
                    //callback
                    options.onSubmit(formValues);
                    
                }
                //truong hop submit voi hanh vi mac dinh 
                else{
                    formElement.submit();
                }
            }
        }

        //lap qua moi rule va xu ly su kien(onblur, oninput)
         options.rules.forEach(function (rule){
            //Luu lai cac rules cho moi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }else{
                selectorRules[rule.selector]=[rule.test];
            }

            var inputElements=formElement.querySelectorAll(rule.selector);//inputElements la 1 Nodelist
            //chuyen sang mảng
            Array.from(inputElements).forEach(function (inputElement){
                 //xu ly truong hop blur khoi input
                 inputElement.onblur=function(){
                    validate(inputElement,rule);
                 }
                 //xu ly moi khi nguoi dung nhap vao input
                 inputElement.oninput=function(){
                     var errorElement=getParent(inputElement, options.formGroupSelector).querySelector('.form-message');
                     errorElement.innerText='';
                     getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                 }
            });
            
       });

    }
}

//dinh nghia rules
//Nguyen tac cua cac rule:
//1)Khi co loi => tra ra messsage loi
//2)Khi hop le =>ko tra ra gi ca (undefined)
Validator.isRequired=function(selector,message){
    return{
        selector:selector,
        test: function(value){
            return value ? undefined : message || 'Vui lòng nhâp trường này';
        }
    };
}
Validator.isEmail=function(selector,message){
    return{
        selector:selector,
        test: function(value){
            var regex=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email';
        }
    };
}

Validator.minLength=function(selector,min,message){
    return{
        selector:selector,
        test: function(value){
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ky tu`;
        }
    };
}

Validator.isConfirmed=function(selector,getConfirmValue,message){
    return{
        selector:selector,
        test: function(value){
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    };
}