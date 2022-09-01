const getClass = element => document.getElementsByClassName(element)[0];
const setEvent = (element, event, action) => getClass(element)?.addEventListener(event, action);

const Mine = new class {
    #tableWidth;
    #tableElement;
    #elementsTable;
    #gameTable;
    #mineCreated = false;
    #isPlaying = true;
    #shakeTimeout;
    #mineList;
    #hiddenSize;
    constructor() {
        this.#tableWidth = 50;
        this.#tableElement = getClass("mine_table");
        this.#reset();
    }

    #reset() {
        this.#createDrawTable();
        this.#createGameTable();
        // this.#createMine();
        this.#mineCreated = false;
        this.#isPlaying = true;
        this.#mineList = [];
        this.#hiddenSize = this.#tableWidth ** 2;
    }
    
    #createDrawTable() {
        this.#tableElement.innerHTML = "";
        this.#elementsTable = [];
        this.#elementsTable.length = this.#tableWidth;
        for(let y = 0; y < this.#tableWidth; y++) {
            this.#elementsTable[y] = [];
            this.#elementsTable[y].length = this.#tableWidth;
            const row = this.#createRowElement();
            for(let x = 0; x < this.#tableWidth; x++) {
                const element = this.#createItemElement(x, y);
                element.addEventListener("click", this.#itemClick(x, y));
                element.addEventListener("contextmenu", this.#itemRightClick(x, y));
                row.appendChild(element);
                this.#elementsTable[y][x] = element;
            }
            this.#tableElement.appendChild(row);
        }
    }
    
    #itemRightClick = (x, y) => e => {
        const element = this.#elementsTable[y][x];
        e.preventDefault();
        if(element.hasAttribute("val")) {
            if(element.getAttribute("val") == -2)
                element.removeAttribute("val");
            return;
        }
        element.setAttribute("val", -2);
    }

    #itemClick = (x, y) => e => {
        if(!this.#isPlaying) {
          this.#reset();
          return;
        }
        if(this.#elementsTable[y][x].hasAttribute("val")) return;
        if(!this.#mineCreated) {
            const checked = [];
            for(let cY = y - 3; cY <= y + 3; cY++) {
                for(let cX = x - 3; cX <= x + 3; cX++)
                    checked.push(`[${cX},${cY}]`);
            }
            this.#createMine(checked);
        }
        this.#showItem(x, y, []);
        this.#tableElement.setAttribute("shake", true);
        this.#tableShakeDisable();
        
        if(this.#gameTable[y][x] == -1)
            this.#gameClose();
    }
    #showItem(x, y, checked) {
        if(x < 0 || x >= this.#tableWidth || y < 0 || y >= this.#tableWidth || checked.includes(`[${x}, ${y}]`)) return;
        checked.push(`[${x}, ${y}]`);
        this.#elementsTable[y][x].setAttribute("val", this.#gameTable[y][x]);
        if(!this.#gameTable[y][x]) {
            this.#showItem(x - 1, y, checked);
            this.#showItem(x + 1, y, checked);
            this.#showItem(x, y - 1, checked);
            this.#showItem(x, y + 1, checked);
            this.#showItem(x - 1, y - 1, checked);
            this.#showItem(x + 1, y - 1, checked);
            this.#showItem(x - 1, y + 1, checked);
            this.#showItem(x + 1, y + 1, checked);
        }
        if(--this.#hiddenSize <= 0) {
            this.#gameClose();
            alert("Game Clear!");
        }
    }
    
    #tableShakeDisable() {
        if(this.#shakeTimeout)// return;
            clearTimeout(this.#shakeTimeout);
        this.#shakeTimeout = setTimeout(() => {
            this.#tableElement.removeAttribute("shake");
        }, 400);
    }
    
    #gameClose() {
      //document.body.innerHTML += "asdf";
      this.#isPlaying = false;
      for(let pos of this.#mineList) {
          pos = pos.split(",");
          const x = parseInt(pos[0]);
          const y = parseInt(pos[1]);
          this.#elementsTable[y][x].setAttribute("val", this.#gameTable[y][x]);
      }
    }

    #createRowElement() {
        const row = document.createElement("div");
        row.classList.add("mine_row");
        return row;
    }

    #createItemElement(x, y) {
        const item = document.createElement("div");
        item.classList.add("mine_item");
        item.alt = [y, x];
        return item;
    }

    #createGameTable() {
        this.#gameTable = [];
        for(let i = 0; i < this.#tableWidth; i++) {
            const row = [];
            row.length = this.#tableWidth;
            this.#gameTable.push(row);
        }
    }

    #createMine(checked) {
        if(this.#mineCreated) return;
        this.#mineCreated = true;
        checked ??= [];
        const mineCount = Math.floor((this.#tableWidth ** 2) * (Math.random() * .06 + .16));
        const getRandomPos = () => Math.round(Math.random() * (this.#tableWidth - 1));
        let i = 0;
        while(i < mineCount && this.#hiddenSize - checked.length > 0) {
            const y = getRandomPos(), x = getRandomPos();
            if(this.#gameTable[y][x] == -1 || checked.includes(`[${x},${y}]`)) continue;
            //this.#gameTable[y][x] ??= 0;
            // if(this.#gameTable[y][x] == -1) continue;
            this.#gameTable[y][x] = -1;
            checked.push(`[${x},${y}]`);
            this.#mineList.push(`${x},${y}`);
            this.#mineInfoUpdate(x, y);
            i++;
        }
        this.#hiddenSize -= this.#mineList.length;
    }

    #mineInfoUpdate(x, y) {
        const startX = Math.max(0, x - 1);
        const endX = Math.min(x + 1, this.#tableWidth - 1);
        const startY = Math.max(0, y - 1);
        const endY = Math.min(y + 1, this.#tableWidth - 1);
        for(y = startY; y <= endY; y++) {
            for(x = startX; x <= endX; x++) {
                this.#gameTable[y][x] ??= 0;
                if(this.#gameTable[y][x] == -1) continue;
                this.#gameTable[y][x]++;
            }
        }
    }

    get gameTable() {
        return this.#gameTable;
    }

    get elementsTable() {
        return this.#elementsTable;
    }
}
