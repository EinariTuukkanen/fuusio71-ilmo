// ============================
// >> WELCOME PAGE
// ============================


// Helper function to insert users in html table
function insertUserToTable(id, index, user) {
    $("#" + id).find('tbody')
    .append($('<tr>')
        .append($('<td>')
            .text(function() {
                if (index > MAX_USERS) return index + ' (jono)';
                return index;
            })
        )
        .append($('<td>')
            .text(user.name.substring(0, 36))
            .css('word-break', 'break-word')
        )
        .append($('<td>')
            .text(user.table.substring(0, 36))
            .css('word-break', 'break-all')
        )
        .css('borderBottom', function() {
            if (index === MAX_USERS) return '4px dashed #dd3b26';
            return '1px solid #1f0044';
        })
    );
}


// On page load get users and insert them to table
$(function() {
    $.ajax({
        url: API_BASE_URL + '/users',
        type: "GET",
        success: function(response) {
            var rawUsersData = JSON.parse(response);

            var usersData = rawUsersData.sort(
                function(a, b) {
                    return a.timestamp - b.timestamp;
                }
            );

            var inviteGuests = rawUsersData.filter(function(a) {
                return a.guildStatus === 'inviteGuest';
            });

            var guildMembers = rawUsersData.filter(function(a) {
                return a.guildStatus === 'currentMember';
            });

            $('#registrationButtonContainer').removeClass('hidden');

            for (var i = 0; i < inviteGuests.length; i++) {
                insertUserToTable('registeredInviteGuests', i + 1, inviteGuests[i]);
            }

            var inviteGuestsCount = inviteGuests.length;

            for (var i = 0; i < guildMembers.length; i++) {
                insertUserToTable('registeredGuildMembers', i + 1, guildMembers[i]);
            }
        },
        error: function(response) {
            console.error('ERROR', response);
        },
    });
});


const backdropText = `Westwärts schweift der Blick; ostwärts streicht das Schiff. Frisch weht der Wind der Heimat zu: mein irisch Kind, wo weilest du? Sind's deiner Seufzer Wehen, die mir die Segel blähen? Wehe, wehe, du Wind! - Weh, ach wehe, mein Kind! - Irische Maid, du wilde, minnige Maid! Wer wagt mich zu höhnen? Brangäne, du? Sag', - wo sind wir? Blaue Streifen stiegen im Osten auf; sanft und schnell segelt das Schiff: auf ruhiger See vor Abend erreichen wir sicher das Land. Welches Land? Kornwalls grünen Strand. Nimmermehr! Nicht heut, noch morgen! Was hör' ich? Herrin! Ha! Entartet Geschlecht! Unwert der Ahnen! Wohin, Mutter, vergabst du die Macht, über Meer und Sturm zu gebieten? O zahme Kunst der Zauberin, die nur Balsamtränke noch braut! Erwache mir wieder, kühne Gewalt; herauf aus dem Busen, wo du dich bargst! Hört meinen Willen, zagende Winde! Heran zu Kampf und Wettergetös'! Zu tobender Stürme wütendem Wirbel! Treibt aus dem Schlaf dies träumende Meer, weckt aus dem Grund seine grollende Gier! Zeigt ihm die Beute, die ich ihm biete! Zerschlag es dies trotzige Schiff, des zerschellten Trümmer verschling's! Und was auf ihm lebt, den wehenden Atem, den lass' ich euch Winden zum Lohn! O weh! Ach! Ach des Übels, das ich geahnt! Isolde! Herrin! Teures Herz! Was bargst du mir so lang? Nicht eine Träne weintest du Vater und Mutter; kaum einen Gruss den Bleibenden botest du. Von der Heimat scheidend kalt und stumm, bleich und schweigend auf der Fahrt; ohne Nahrung, ohne Schlaf; starr und elend, wild verstört: wie ertrug ich, so dich sehend, nichts dir mehr zu sein, fremd vor dir zu stehn? Oh, nun melde, was dich müht! Sage, künde, was dich quält! Herrin Isolde, trauteste Holde! Soll sie wert sich dir wähnen, vertraue nun Brangänen! Luft! Luft! Mir erstickt das Herz! Öffne! Öffne dort weit! Die Vorigen. Tristan. Kurwenal. Schiffswolk. Ritter und Knappen. Frisch weht der Wind der Heimat zu: mein irisch Kind, wo weilest du? Sind's deiner Seufzer Wehen, die mir die Segel blähen? Wehe, wehe, du Wind! Weh, ach wehe, mein Kind! Mir erkoren, mir verloren, hehr und heil, kühn und feig! Todgeweihtes Haupt! Todgeweihtes Herz! Was hältst du von dem Knechte? Wen meinst du? Dort den Helden, der meinem Blick den seinen birgt, in Scham und Scheue abwärts schaut. Sag, wie dünkt er dich? Frägst du nach Tristan, teure Frau? dem Wunder aller Reiche, dem hochgepriesnen Mann, dem Helden ohne Gleiche, des Ruhmes Hort und Bann? Der zagend vor dem Streiche sich flüchtet, wo er kann, weil eine Braut er als Leiche für seinen Herrn gewann! Dünkt es dich dunkel, mein Gedicht? Frag ihn denn selbst, den freien Mann, ob mir zu nahn er wagt? Der Ehren Gruss und zücht'ge Acht vergisst der Herrin der zage Held, dass ihr Blick ihn nur nicht erreiche, den Helden ohne Gleiche! Oh, er weiss wohl, warum! Zu dem Stolzen geh, meld ihm der Herrin Wort! Meinem Dienst bereit, schleunig soll er mir nahn. Soll ich ihn bitten, dich zu grüssen? Befehlen liess dem Eigenholde Furcht der Herrin ich, Isolde! Hab acht, Tristan! Botschaft von Isolde. Was ist? Isolde? - Von meiner Herrin? Ihr gehorsam, was zu hören meldet höfisch mir die traute Magd? Mein Herre Tristan, euch zu sehen wünscht Isolde, meine Frau. Grämt sie die lange Fahrt, die geht zu End'; eh' noch die Sonne sinkt, sind wir am Land. Was meine Frau mir befehle, treulich sei's erfüllt. So mög Herr Tristan zu ihr gehn: das ist der Herrin Will'. Wo dort die grünen Fluren dem Blick noch blau sich färben, harrt mein König meiner Frau: zu ihm sie zu geleiten, bald nah ich mich der Lichten: keinem gönnt' ich diese Gunst. Mein Herre Tristan, höre wohl: deine Dienste will die Frau, dass du zur Stell ihr nahtest dort, wo sie deiner harrt. Auf jeder Stelle, wo ich steh, getreulich dien ich ihr, der Frauen höchster Ehr'; liess ich das Steuer jetzt zur Stund', wie lenkt' ich sicher den Kiel zu König Markes Land? Tristan, mein Herre! Was höhnst du mich? Dünkt dich nicht deutlich die tör'ge Magd, hör meiner Herrin Wort! So, hiess sie, sollt ich sagen: Befehlen liess dem Eigenholde Furcht der Herrin sie, Isolde. Darf ich die Antwort sagen? Was wohl erwidertest du? Das sage sie der Frau Isold'! Wer Kornwalls Kron' und Englands Erb' an Irlands Maid vermacht, der kann der Magd nicht eigen sein, die selbst dem Ohm er schenkt. Ein Herr der Welt Tristan der Held! Ich ruf's: du sag's, und grollten mir tausend Frau Isolden! "Herr Morold zog zu Meere her, in Kornwall Zins zu haben; ein Eiland schwimmt auf ödem Meer, da liegt er nun begraben! Sein Haupt doch hängt im Irenland, als Zins gezahlt von Engeland: hei! unser Held Tristan, wie der Zins zahlen kann!" "Sein Haupt doch hängt im Irenland, als Zins gezahlt von Engeland: hei! unser Held Tristan, wie der Zins zahlen kann!" Weh, ach wehe! Dies zu dulden! Doch nun von Tristan! Genau will ich's vernehmen. Ach, frage nicht! Frei sag's ohne Furcht! Mit höf'schen Worten wich er aus. Doch als du deutlich mahntest? Da ich zur Stell ihn zu dir rief: wo er auch steh', so sagte er, getreulich dien er ihr, der Frauen höchster Ehr'; liess' er das Steuer jetzt zur Stund', wie lenkt' er sicher den Kiel zu König Markes Land? "Wie lenkt' er sicher den Kiel zu König Markes Land?" Den Zins ihm auszuzahlen, den er aus Irland zog! Auf deine eignen Worte, als ich ihm die entbot, liess seinen Treuen Kurwenal! - Den hab ich wohl vernommen, kein Wort, das mir entging. Erfuhrest du meine Schmach, nun höre, was sie mir schuf. Wie lachend sie mir Lieder singen, wohl könnt auch ich erwidern! Von einem Kahn, der klein und arm an Irlands Küste schwamm, darinnen krank ein siecher Mann elend im Sterben lag. Isoldes Kunst ward ihm bekannt; mit Heilsalben und Balsamsaft der Wunde, die ihn plagte, getreulich pflag sie da. Der "Tantris" mit sorgender List sich nannte, als Tristan Isold' ihn bald erkannte, da in des Müss'gen Schwerte eine Scharte sie gewahrte, darin genau sich fügt' ein Splitter, den einst im Haupt des Iren-Ritter, zum Hohn ihr heimgesandt, mit kund'ger Hand sie fand. Da schrie's mir auf aus tiefstem Grund! Mit dem hellen Schwert ich vor ihm stund, an ihm, dem Überfrechen, Herrn Morolds Tod zu rächen. Von seinem Lager blickt' er her, - nicht auf das Schwert, nicht auf die Hand, - er sah mir in die Augen. Seines Elendes jammerte mich; - das Schwert - ich liess es fallen! Die Morold schlug, die Wunde, sie heilt' ich, dass er gesunde, und heim nach Hause kehre, - mit dem Blick mich nicht mehr beschwere! O Wunder! Wo hatt' ich die Augen? Der Gast, den einst ich pflegen half? Sein Lob hörtest du eben: "Hei! unser Held Tristan" - der war jener traur'ge Mann. Er schwur mit tausend Eiden mir ew'gen Dank und Treue! Nun hör, wie ein Held Eide hält! Den als Tantris unerkannt ich entlassen, als Tristan kehrt' er kühn zurück; auf stolzem Schiff, von hohem Bord, Irlands Erbin begehrt er zur Eh' für Kornwalls müden König, für Marke, seinen Ohm. Da Morold lebte, wer hätt' es gewagt uns je solche Schmach zu bieten? Für der zinspflicht'gen Kornen Fürsten um Irlands Krone zu werben! Ach, wehe mir! Ich ja war's, die heimlich selbst die Schmach sich schuf. Das rächende Schwert, statt es zu schwingen, machtlos liess ich's fallen! Nun dien ich dem Vasallen! Da Friede, Sühn' und Freundschaft von allen ward beschworen, wir freuten uns all' des Tags; wie ahnte mir da, dass dir es Kummer schüf'? O blinde Augen! Blöde Herzen! Zahmer Mut, verzagtes Schweigen! Wie anders prahlte Tristan aus, was ich verschlossen hielt! Die schweigend ihm das Leben gab, vor Feindes Rache ihn schweigend barg; was stumm ihr Schutz zum Heil ihm schuf, - mit ihr gab er es preis! Wie siegprangend heil und hehr, laut und hell wies er auf mich: "Das wär ein Schatz, mein Herr und Ohm; wie dünkt euch die zur Eh'? Die schmucke Irin hol ich her; mit Steg und Wegen wohlbekannt, ein Wink, ich flieg nach Irenland: Isolde, die ist euer! - mir lacht das Abenteuer!" Fluch dir, Verruchter! Fluch deinem Haupt! Rache! Tod! Tod uns beiden! O Süsse! Traute! Teure! Holde! Goldne Herrin! Lieb' Isolde! Hör mich! Komme! Setz dich her! Welcher Wahn! Welch eitles Zürnen! wie magst du dich betören, nicht hell zu sehn noch hören? Was je Herr Tristan dir verdankte, sag, konnt' er's höher lohnen, als mit der herrlichsten der Kronen? So dient' er treu dem edlen Ohm; dir gab er der Welt begehrlichsten Lohn: dem eignen Erbe, echt und edel, entsagt er zu deinen Füssen, als Königin dich zu grüssen! Und warb er Marke dir zum Gemahl, wie wolltest du die Wahl doch schelten, muss er nicht wert dir gelten? Von edler Art und mildem Mut, wer gliche dem Mann an Macht und Glanz? Dem ein hehrster Held so treulich dient, wer möchte sein Glück nicht teilen, als Gattin bei ihm weilen? Ungeminnt den hehrsten Mann stets mir nah zu sehen, wie könnt ich die Qual bestehen? Was wähnst du Arge? Ungeminnt? - Wo lebte der Mann, der dich nicht liebte? der Isolde säh, und in Isolden selig nicht ganz verging? Doch, der dir erkoren, wär' er so kalt, zög ihn von dir ein Zauber ab: den bösen wüsst ich bald zu binden; ihn bannte der Minne Macht. Kennst du der Mutter Künste nicht? Wähnst du, die alles klug erwägt, ohne Rat in fremdes Land hätt' sie mit dir mich entsandt? Der Mutter Rat gemahnt mich recht; willkommen preis ich ihre Kunst: - Rache für den Verrat, - Ruh in der Not dem Herzen! - Den Schrein dort bring mir her! Er birgt, was heil dir frommt. So reihte sie die Mutter, die mächt'gen Zaubertränke. Für Weh und Wunden Balsam hier; für böse Gifte Gegengift. Den hehrsten Trank, ich halt' ihn hier.`;

$('#text-backdrop').text(backdropText);


