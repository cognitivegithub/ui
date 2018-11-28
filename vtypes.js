Ext.apply(Ext.form.VTypes, {
  password: function(value, field)
  {
    if (field.initialPasswordField)
    {
      var pwd = Ext.getCmp(field.initialPasswordField);
      this.passwordText = 'Введенные Вами пароли не совпадают';
      return (value == pwd.getValue());
    }

    this.passwordText = 'Пароль не должен быть короче 5 символов и должен содержать хотя бы одну цифру или специальный символ (!@#$%^&*()-_=+)';

    var hasSpecial = value.match(/[0-9!@#\$%\^&\*\(\)\-_=\+]+/i);
    var hasLength = (value.length >= 5);

    return (hasSpecial && hasLength);
  },
  passwordText: 'Пароль не должен быть короче 5 символов и должен содержать хотя бы одну цифру или специальный символ (!@#$%^&*()-_=+)'
});

Ext.apply(Ext.form.VTypes, {
	phone : function(val, field) {
		var sPhoneMask = /^[+]?[0-9()\-\s]*$/;
		return sPhoneMask.test(val);
	},
  	phoneText: 'Номер телефона может содержать только цифры, круглые скобки, тире и первый символ плюс'
});

Ext.apply(Ext.form.VTypes, {
	money : function(val, field) {
		var sMoneyMask = /^[0123456789\.\s]*$/;
		return sMoneyMask.test(val);
	},
  	moneyText : 'Значение может содержать только цифры и точку, отделяющую дробную часть от целой'
});

Ext.apply(Ext.form.VTypes, {
  digits : function(val, field) {
    var sDigitsMask = /^[1234567890]*$/;
    return sDigitsMask.test(val);
  },
  digitsText : 'Вводите только цифры без пробелов и разделительных знаков'
});

function validateINN(inn) {
  if (''==inn) {
    return true;
  }
  var cksum = checkSumINN(inn);
  if (false!==cksum && cksum == inn.substr(inn.length-cksum.length)) {
    return true;
  }
  return false;
}

Ext.apply(Ext.form.VTypes, {
  inn : function(val, field) {
    return validateINN(val);
  },
  innText: 'Некорректный ИНН'
});

Ext.apply(Ext.form.VTypes, {
  email: function(email) {
    email = String(email);
    var atIndex = email.lastIndexOf("@");
    if (atIndex<0)
    {
      return false;
    }
    var domain = email.substr(atIndex+1);
    var local = email.substr(0, atIndex);
    var localLen = local.length;
    var domainLen = domain.length;
    if (localLen < 1 || localLen > 64)
    {
      // local part length exceeded
      return false;
    }
    if (domainLen < 1 || domainLen > 255)
    {
      // domain part length exceeded
      return false;
    }
    if (local.charAt(0) == '.' || local.charAt(localLen-1) == '.')
    {
      // local part starts or ends with '.'
      return false;
    }
    if (local.indexOf('..')>=0)
    {
      // local part has two consecutive dots
      return false;
    }
    if (!/^[A-Za-z0-9.\-]+$/.test(domain))
    {
      // character not valid in domain part
      return false;
    }
    if (domain.indexOf('..')>=0)
    {
      // domain part has two consecutive dots
      return false;
    }
    if (!/^(\\.|[A-Za-z0-9!#%&`_=\\/$\'*+?^{}|~.-])+$/.test(local.replace('\\\\', '')))
    {
      // character not valid in local part unless
      // local part is quoted
      if (!/^"(\\"|[^"])+"$/.test(local.replace("\\\\", "")))
      {
        return false;
      }
    }
    return true;
  }
});

