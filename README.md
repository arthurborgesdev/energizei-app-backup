# energizei-app-backup

(Backup from codebase energizei_app from energ-deploy server in Digital Ocean)


## What it is for?

Communicates with the energy meter to access measurements data and send it to the server, to be stored in the database.


## Main files and its functions

**/app.js**

Store the tags in a variable called "oneSecond_tag". These tags contains the strings of the registers separated by a comma following the format "PL__^HXXXX[YY]__PL".

"XXXX" is a group of numbers representing the registers and YY represents the quantity of characters or bytes inside this register. It is necessary to consult the SCHNEIDER manual to identify each register and its corresponding functionality. The actual codebase contains the most basic measurements and the harmonics from voltage and current until the 25th order.

Then, a POST with this tag is made to a internal URL of the meter to store the data received in a String. All elements of the String is then separate in a Array using the split by comma and then made a recording in a object containing several fields (parameters), each one resolved using a specific function (refer to SCHNEIDER documentation, for the specific one for use). Then, this data is stored in a MongoDB database each 1 second.


## Built with

- PM5560
- Digital Ocean servers
- Node.js/JavaScript

## Usage 

- This codebase works with a PM5560 and Raspberry PI. It exists for future reference only of my coding skills and creativity in 2018.

## Author

👤 **Arthur Borges**

- GitHub: [@arthuborgesdev](https://github.com/arthurborgesdev)
- Twitter: [@arthurmoises](https://twitter.com/arthurmoises)
- LinkedIn: [Arthur Borges](https://linkedin.com/in/arthurmoises)


## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## Show your support

Give a ⭐️ if you like this project!

## Acknowledgments

- Energizei Engenharia and all related people
- Lots and lots of Stack Overflow questions and answers