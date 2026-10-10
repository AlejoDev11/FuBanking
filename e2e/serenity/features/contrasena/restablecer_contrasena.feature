# language: es
Requisito: Restablecimiento de Contraseña

  Para recuperar el acceso a mi cuenta
  Como cliente que olvidó su contraseña
  Quiero poder restablecerla de forma segura

  @api @contrasena
  Escenario: Solicitar restablecimiento con email existente
    Dado Ana es clienta con una cuenta de ahorros con saldo de 0
    Cuando ella solicita restablecer la contraseña con su email
    Entonces la respuesta HTTP tiene estado 200

  @api @contrasena @validaciones
  Escenario: Solicitar restablecimiento con email no registrado
    Cuando alguien solicita restablecer la contraseña del email "fantasma@fubanking.test"
    Entonces la respuesta HTTP tiene estado 200

  @api @contrasena @validaciones
  Escenario: Verificar token de restablecimiento inválido
    Cuando alguien verifica el token de restablecimiento "token-falso-12345"
    Entonces la respuesta HTTP tiene estado 404

  @api @contrasena @validaciones
  Escenario: Restablecer contraseña con token inválido
    Cuando alguien intenta restablecer la contraseña con token "token-falso" y nueva contraseña "NuevaClave123!"
    Entonces la respuesta HTTP tiene estado 400
