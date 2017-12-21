/*
 * This file is responsible for performing the logic of replacing
 * all occurrences of each mapped word with its emoji counterpart.
 */
var hasMatches = false;
var regexes = {ssn: /\d{3}[- ]?\d{2}[- ]?\d{4}/g,
               cc : /\b(3[47]\d{2}([ -]?)(?!(\d)\3{5}|123456|234567|345678)\d{6}\2(?!(\d)\4{4})\d{5}|((4\d|5[1-5]|65)\d{2}|6011)([ -]?)(?!(\d)\8{3}|1234|3456|5678)\d{4}\7(?!(\d)\9{3})\d{4}\7\d{4})\b/g}
/**
 * Substitutes emojis into text nodes.
 * If the node contains more than just text (ex: it has child nodes),
 * call scanText() on each of its children.
 *
 * @param  {Node} node    - The target DOM Node.
 * @return {void}         - Note: the emoji substitution is done inline.
 */
function scanText (node) {
  // Setting textContent on a node removes all of its children and replaces
  // them with a single text node. Since we don't want to alter the DOM aside
  // from substituting text, we only substitute on single text nodes.
  // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
  if (node.nodeType === Node.TEXT_NODE) {
  //if (!node.childNodes.length) {
    // This node only contains text.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType.


    // Because DOM manipulation is slow, we don't want to keep setting
    // textContent after every replacement. Instead, manipulate a copy of
    // this string outside of the DOM and then perform the manipulation
    // once, at the end.
    let content = node.textContent;
    //let content = node.innerHTML;
    // Replace every occurrence of 'word' in 'content' with its emoji.
    // Use the emojiMap for replacements.
    for (var type in regexes){
        var matches = content.match(regexes[type])
        if (matches && matches.length){
            if (!hasMatches){
                hasMatches = true;
            }
            node.parentElement.style.color = "red";
            node.parentElement.style.backgroundColor = "yellow";
        }
    }
    // Actually do the replacement / substitution.
    // Note: if 'word' does not appear in 'content', nothing happens.
    //content = content.replace(regex, emoji);

    // Now that all the replacements are done, perform the DOM manipulation.
    //node.textContent = content;
  }
  else {
    // This node contains more than just text, call scanText() on each
    // of its children.
    for (let i = 0; i < node.childNodes.length; i++) {
      scanText(node.childNodes[i]);
    }    
  }
}

function scanFormElement(element){
    for (var type in regexes){
        var matches = element.value.match(regexes[type])
        if (matches && matches.length){
            if (!hasMatches){
                hasMatches = true;
            }
       }
   }
}

function warnUser(evt){
   for (var i=0; i < evt.target.elements.length; i++){
       scanFormElement(evt.target.elements[i]);
   }
   if (hasMatches) {
       if(!confirm("Are you sure you want submit personal data?")){
           evt.preventDefault();
       }
   }
}

function scanForForms(){
        for (var i in document.forms){
           var form = document.forms[i];
           form.addEventListener("submit", warnUser);
        }
    }


// Start the recursion from the body tac
scanText(document.body);

//document.addEventListener('DOMContentLoaded',scanForForms);
scanForForms();

// Now monitor the DOM for additions and substitute emoji into new nodes.
// @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver.
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      // This DOM change was new nodes being added. Run our substitution
      // algorithm on each newly added node.
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        const newNode = mutation.addedNodes[i];
        scanText(newNode);
      scanForForms();
      }
    }
  });
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});
