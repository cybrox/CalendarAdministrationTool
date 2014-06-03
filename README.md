Calendar Administration Tool - Fachübergreifende Projekte HST/INF Technische Berufsschule Zürich, 5. Semester

**Important Note:** *This software is using its own core to handle links, data-shifts and ... well, pretty much everything. I'd use Ember.js if I'd be allowed to but since that obviously isn't the case, the tools is based on a selfwritten, minimalized core. Basically...*
#####It's shit and I'm actually pretty ashamed of its source.

Preamble
===
The Calendar administration tool (short CAT) is a server based calender that allows you to manage and evaluate upcoming events, tasks and exams. It is designed especially for the use in student groups or instructive operation. CAT is a web application, therefore the user can run it without anything else than the default browser.

Functionality
===
The tool is based on a usersystem that supports two fixed groups with different permissions and possibilities. The administrator can view the calender, tasks and marks of all normal users which themselves can create, edit or delete tasks or upcoming event. The whole concept is based around an educational use so its main purpose is to allow a simple way for leaders or instructors to check the progress of their apprentice and allow them to easily manage their educational life.
Normal users can create, edit and delete tasks or exams in their calender or manage their semesters which allow them to evaluate the collected marks in a defined timespan. The administrator can access all users calender and make any changes he may wish.

Technologies
===
The application itself is based on a HTML and CSS user interface working on a Javascript and AJAX backend. It also uses jQuery and jQueryUI as well as the jQueryCookie and the jQueryCrypt plugin in order to increase development speed, handle cookies and encrypt passwords.
The server side system consists of a simpel modular PHP API that allows the frontend to read and write data in the JSON format from the MySQL database, in order to do that, the API is only accessible with a valid user token that will be generated on a successful login.
It will be developed using only the free text editor Notepad++ and GitHub as version control system.

Documentation
===
The whole source code will be documented directly in the source file, complex structures such as the data API and especially its usage are documented on external documents.
