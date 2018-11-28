Application.components.CheckEdsPanel = Ext.extend(Ext.Panel, {
  frame : true,

  initComponent : function () {
    var component = this;

    function createTestString() {
      var testchars = '';

      /*for(var i=0; i<=255; i++) {
        testchars = testchars+String.fromCharCode(i);
      }*/

      var teststring = "Тестирование ЭП\n"+
      "тестовая строка\n"+
      "съешь ещё этих мягких французских булок, да выпей чаю\r\n"+
      "Тестирование бинарных данных (символы с кодами 0-255): «"+testchars+"»\n"+
      "Конец тестовой строки";

      if (teststring.length%2 && Ext.isIE9) {
        // гарантируем четность длины тестовой строки, чтобы не напрягать
        // сообщением об ошибке в IE9, rel #33756
        teststring += '\n';
      }

      return teststring;
    }

    Ext.apply(this, {
      bodyCssClass: 'subpanel',
      bodyStyle: 'padding-top: 5px;',
      items: {
        xtype: 'fieldset',
        title: 'Для проверки вашей ЭП, пожалуйста, нажмите на кнопку ниже',
        style: 'margin-bottom: 5px;',
        buttonAlign: 'center',
        buttons: [{
          text: 'Проверить ЭП',
          handler: function() {
              var string = createTestString();
              if (Main.signaturePlugin == 'capicom') {
                  var signatureValue = signData(Ext.util.Base64.decode(string));

                  if (!checkSignatureResult(signatureValue)) {
                      return false;
                  }
                  performRPCCall(RPC.User.checkcertificate, [{signature: signatureValue}], null, function (resp) {
                      echoResponseMessage(resp);
                  });
                  return false;
              }
              else if (Main.signaturePlugin == 'cryptopro') {
                  CryptoPlugin.signMessage({
                      message: string,
                      success: function (response) {
                          if (!checkSignatureResult(string)) {
                              return false;
                          }
                          var oCert = response.certificate;
                          performRPCCall(RPC.Eds.parse, [{eds: response.message_signed}], null, function (response) {
                              var title = '', message = '';
                              if (false === response.success) {
                                  title = 'Ошибка';
                                  message = '';
                                  if (!Ext.isEmpty(response.message)) {
                                      message += response.message;
                                  }
                              } else {
                                  title = 'Проверка ЭП';
                                  message = 'ЭП успешно прошла проверку.';
                                  if (response.eds && response.eds['signed-by'] && response.eds['fingerprint-sha1']) {
                                      message += 'Отпечаток подписи: ' + response.eds['fingerprint-sha1'];
                                  }
                              }
                              Ext.MessageBox.alert(title, message);
                          });
                          return false;
                      },
                      failure: function (response) {
                          var oCert = response.certificate;
                          var message = '<span style="color:red;">Ошибка при тестировании подписи</span>';
                          message += component.getCertInfo(oCert);
                          Ext.MessageBox.alert('Ошибка', message);
                      }
                  });
              }
              return false;
          }
        }]
      }
    });
    Application.components.CheckEdsPanel.superclass.initComponent.call(this);
  }
});
