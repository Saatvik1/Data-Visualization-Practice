document.getElementById('main_submit').addEventListener('click', function() {
    var inputText = document.getElementById('main_input').value;

    // Get rid of white spaces, then count the length. 
    const non_ws_c = inputText.trim().length

    //get a count of each character
    const count_char = {}
    for(let chara of inputText){
        if (count_char[chara]){
            count_char[chara]++;
        } else {
            count_char[chara] = 1
        }
    }

    var count_char_result = "";
    for(let chara in count_char){
        count_char_result += `${chara} : ${count_char[chara]}\n` 
    }

    //Count words and spaces 
    const num_words = inputText.trim().split(/\s+/).length;
    const num_spaces = (inputText.match(/ /g) || []).length;

    // Detecting repeated characters 
    const error_spell = [];
    let seq = '';
    let prevchar = '';
    let count = 0;

    for(let char of inputText){
        if(char === prevchar){
            count++;
            seq+=char;
        } else {
            if(count > 2){
                error_spell.push(seq);
            }

            seq = char;
            count = 1;
        }
        prevchar = char;
    }

    if(count > 2){
        error_spell.push(seq)
    }

    var spell_message = "";
    if (error_spell.length > 0){
        spell_message = "There are spelling errors: \n";
        error_spell.forEach(seq => {
            spell_message += `error: "${seq}" \n`
        });
    } else {
        spell_message = "There are NO spelling errors: \n";
    }




    output_text = `Non-whitespace characters: ${non_ws_c} \n Count of each character: ${count_char_result} \n Count of words: ${num_words} \n Count of spaces: ${num_spaces} \n Repeated Characters: ${spell_message}`
    document.getElementById('output').textContent = output_text;

    console.log("Input text: " + inputText);
    console.log(output_text)
});

