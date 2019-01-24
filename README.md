# energizei-app-backup
(Backup do código energizei_app do servidor energ-deploy Digital Ocean)

## Pra que serve?

Se comunica com o medidor de Energia para acessar os dados de medição e mandá-los para o servidor, a fim de serem gravados no banco de dados.


## Como funciona?


## Arquivos principais e suas funções

**/app.js**

Grava as tags em uma variável chamada "oneSecond_tag". Essas tags contém as strings dos registradores separadas por vírgula e em que cada registrador segue o formato: PL__^HXXXX[YY]__PL.

Em que XXXX é um grupo de números contendo os registradores e YY a quantidade de caracteres ou bytes contendo nesse registrador. Se referenciar aos manuais da SCHNEIDER para identificar qual registrador se corresponde ao que quer extrair. No código atual foram extraídos as medições mais básicas e as harmônicas de tensão e corrente até a ordem 25.

É feito então um POST com essa tag para uma url interna ao medidor de forma a gravar os dados recebidos em uma String. Todos os elementos da String são então separados em um array utilizando a separação por vírgula e feito a gravação em um objeto contendo vários campos (parâmetros), cada um resolvido utilizando uma função específica (consultar documentação da SCHNEIDER para quais funções utilizar). Depois, esses dados são gravados em um banco MongoDB a cada 1 segundo (procurar pelo script a cada 60 segundos ou reconstruí-lo a partir desse).
