"""Seed course content: Spanish for English speakers.

Each skill lists vocabulary (spanish, english, emoji), sentence pairs
(spanish, english alternatives separated by "|") and fill-in-the-blank items
(before, answer, after, english translation, distractors). `builder.py` turns
these into concrete exercises.
"""

COURSE = {
    "code": "es-en",
    "title": "Spanish",
    "learning_language": "es",
    "learning_language_name": "Spanish",
    "from_language": "en",
    "flag": "🇪🇸",
}

LESSONS_PER_SKILL = 3

UNITS = [
    {
        "title": "Order at a café",
        "description": "Learn your first words, greet people, talk about food",
        "color": "#58CC02",
        "guidebook": {
            "phrases": [
                {"text": "Hola, ¿cómo estás?", "translation": "Hello, how are you?"},
                {"text": "Un café y un vaso de agua, por favor.", "translation": "A coffee and a glass of water, please."},
                {"text": "Yo como pan.", "translation": "I eat bread."},
                {"text": "Ella es una mujer.", "translation": "She is a woman."},
                {"text": "Gracias, adiós.", "translation": "Thanks, goodbye."},
            ],
            "tips": [
                {
                    "title": "Masculine & feminine: el & la",
                    "body": "Every Spanish noun is either masculine or feminine. Use **el** (the) with masculine nouns and **la** (the) with feminine nouns.",
                    "table": {"headers": ["Masculine", "Feminine"], "rows": [["el pan", "la leche"], ["el café", "la manzana"], ["el niño", "la niña"]]},
                    "examples": [
                        {"text": "El café es bueno.", "translation": "The coffee is good."},
                        {"text": "La leche es buena.", "translation": "The milk is good."},
                    ],
                },
                {
                    "title": "Questions & exclamations: ¿? ¡!",
                    "body": "Spanish questions and exclamations open with an upside-down mark: **¿** and **¡**.",
                    "examples": [
                        {"text": "¿Cómo estás?", "translation": "How are you?"},
                        {"text": "¡Hola!", "translation": "Hello!"},
                    ],
                },
                {
                    "title": "Dropping yo, tú, él & ella",
                    "body": "The verb ending already shows who is acting, so subject pronouns like **yo** (I) are often left out.",
                    "examples": [
                        {"text": "Yo como pan.", "translation": "I eat bread."},
                        {"text": "Como pan.", "translation": "I eat bread."},
                    ],
                },
            ],
        },
        "skills": [
            {
                # Duolingo's own first lessons (sentences, illustrations, voice audio).
                "title": "First words",
                "icon": "☕",
                "static": "duolingo",
            },
            {
                "title": "Greetings",
                "icon": "👋",
                "words": [
                    ("hola", "hello", "👋"),
                    ("adiós", "goodbye", "🚶"),
                    ("gracias", "thank you", "🙏"),
                    ("buenos días", "good morning", "🌅"),
                    ("buenas noches", "good night", "🌙"),
                    ("sí", "yes", "👍"),
                    ("no", "no", "👎"),
                    ("por favor", "please", "🥺"),
                ],
                "sentences": [
                    ("Hola, ¿cómo estás?", "Hello, how are you?|Hi, how are you?"),
                    ("Buenos días, Ana.", "Good morning, Ana."),
                    ("Adiós, Juan.", "Goodbye, Juan.|Bye, Juan."),
                    ("Gracias, señor.", "Thank you, sir.|Thanks, sir."),
                    ("Sí, por favor.", "Yes, please."),
                    ("Buenas noches, mamá.", "Good night, mom.|Good evening, mom."),
                ],
                "blanks": [
                    ("Buenos", "días", ", Ana.", "Good morning, Ana.", ["noches", "gracias"]),
                    ("Hola, ¿cómo", "estás", "?", "Hello, how are you?", ["eres", "soy"]),
                    ("Muchas", "gracias", ".", "Thank you very much.", ["adiós", "hola"]),
                ],
            },
            {
                "title": "Food",
                "icon": "🍎",
                "words": [
                    ("el pan", "the bread", "🍞"),
                    ("el agua", "the water", "💧"),
                    ("la manzana", "the apple", "🍎"),
                    ("la leche", "the milk", "🥛"),
                    ("el café", "the coffee", "☕"),
                    ("el queso", "the cheese", "🧀"),
                    ("la naranja", "the orange", "🍊"),
                    ("el arroz", "the rice", "🍚"),
                ],
                "sentences": [
                    ("Yo como pan.", "I eat bread.|I am eating bread.|I'm eating bread."),
                    ("Tú bebes agua.", "You drink water.|You are drinking water.|You're drinking water."),
                    ("Ella bebe leche.", "She drinks milk.|She is drinking milk.|She's drinking milk."),
                    ("Yo como una manzana.", "I eat an apple.|I am eating an apple.|I'm eating an apple."),
                    ("El café es bueno.", "The coffee is good."),
                    ("Nosotros comemos arroz.", "We eat rice.|We are eating rice.|We're eating rice."),
                ],
                "blanks": [
                    ("Yo", "como", "pan.", "I eat bread.", ["bebes", "come"]),
                    ("Tú", "bebes", "agua.", "You drink water.", ["bebo", "como"]),
                    ("Ella bebe", "leche", ".", "She drinks milk.", ["pan", "manzana"]),
                ],
            },
            {
                "title": "People",
                "icon": "👫",
                "words": [
                    ("el hombre", "the man", "👨"),
                    ("la mujer", "the woman", "👩"),
                    ("el niño", "the boy", "👦"),
                    ("la niña", "the girl", "👧"),
                    ("el bebé", "the baby", "👶"),
                    ("el amigo", "the friend", "🤝"),
                    ("la profesora", "the teacher", "👩‍🏫"),
                    ("el doctor", "the doctor", "👨‍⚕️"),
                ],
                "sentences": [
                    ("Yo soy un hombre.", "I am a man.|I'm a man."),
                    ("Ella es una mujer.", "She is a woman.|She's a woman."),
                    ("El niño come pan.", "The boy eats bread.|The boy is eating bread."),
                    ("La niña bebe agua.", "The girl drinks water.|The girl is drinking water."),
                    ("Él es mi amigo.", "He is my friend.|He's my friend."),
                    ("Tú eres un niño.", "You are a boy.|You're a boy."),
                ],
                "blanks": [
                    ("Yo", "soy", "un hombre.", "I am a man.", ["eres", "es"]),
                    ("Ella", "es", "una mujer.", "She is a woman.", ["soy", "eres"]),
                    ("La", "niña", "bebe agua.", "The girl drinks water.", ["hombre", "niño"]),
                ],
            },
        ],
    },
    {
        "title": "Order food and drink",
        "description": "Order at a café, eat at a restaurant, use numbers",
        "color": "#CE82FF",
        "guidebook": {
            "phrases": [
                {"text": "Un café, por favor.", "translation": "A coffee, please."},
                {"text": "Quiero un helado y un té.", "translation": "I want an ice cream and a tea."},
                {"text": "La cuenta, por favor.", "translation": "The check, please."},
                {"text": "Yo tengo dos manzanas.", "translation": "I have two apples."},
                {"text": "Hay cinco niños.", "translation": "There are five children."},
            ],
            "tips": [
                {
                    "title": "Ordering with quiero",
                    "body": "**Quiero** means \"I want\". Add **por favor** to be polite.",
                    "examples": [
                        {"text": "Quiero un café, por favor.", "translation": "I want a coffee, please."},
                        {"text": "Quiero una galleta.", "translation": "I want a cookie."},
                    ],
                },
                {
                    "title": "A & one: un & una",
                    "body": "**Un** and **una** mean \"a\" or \"one\". They match the gender of the noun.",
                    "table": {"headers": ["Spanish", "English"], "rows": [["un pastel", "a cake"], ["una galleta", "a cookie"]]},
                    "examples": [{"text": "Un sándwich y una taza de té.", "translation": "A sandwich and a cup of tea."}],
                },
                {
                    "title": "There is & there are: hay",
                    "body": "Use **hay** for both \"there is\" and \"there are\".",
                    "examples": [
                        {"text": "Hay un perro.", "translation": "There is a dog."},
                        {"text": "Hay cinco niños.", "translation": "There are five children."},
                    ],
                },
            ],
        },
        "skills": [
            {
                "title": "Café",
                "icon": "☕",
                "words": [
                    ("el té", "the tea", "🍵"),
                    ("el jugo", "the juice", "🧃"),
                    ("el azúcar", "the sugar", "🍬"),
                    ("el pastel", "the cake", "🍰"),
                    ("la galleta", "the cookie", "🍪"),
                    ("el sándwich", "the sandwich", "🥪"),
                    ("el helado", "the ice cream", "🍦"),
                    ("la taza", "the cup", "🫖"),
                ],
                "sentences": [
                    ("Un café, por favor.", "A coffee, please.|One coffee, please."),
                    ("Quiero un té.", "I want a tea.|I want tea.|I want a cup of tea."),
                    ("¿Tienes jugo?", "Do you have juice?|Have you got juice?"),
                    ("El pastel es dulce.", "The cake is sweet."),
                    ("Yo quiero una galleta.", "I want a cookie.|I want a biscuit."),
                    ("El helado es frío.", "The ice cream is cold."),
                ],
                "blanks": [
                    ("Un café, por", "favor", ".", "A coffee, please.", ["gracias", "hola"]),
                    ("Yo", "quiero", "un pastel.", "I want a cake.", ["quieres", "bebe"]),
                    ("El pastel es", "dulce", ".", "The cake is sweet.", ["fría", "dulces"]),
                ],
            },
            {
                "title": "Restaurant",
                "icon": "🍽️",
                "words": [
                    ("la sopa", "the soup", "🍲"),
                    ("la carne", "the meat", "🥩"),
                    ("el pescado", "the fish", "🐟"),
                    ("la ensalada", "the salad", "🥗"),
                    ("el vino", "the wine", "🍷"),
                    ("la cuenta", "the check", "🧾"),
                    ("el menú", "the menu", "📋"),
                    ("el plato", "the plate", "🍽️"),
                ],
                "sentences": [
                    ("La cuenta, por favor.", "The check, please.|The bill, please."),
                    ("Yo quiero la sopa.", "I want the soup."),
                    ("El pescado es fresco.", "The fish is fresh."),
                    ("Ella come ensalada.", "She eats salad.|She is eating salad.|She's eating salad."),
                    ("Nosotros queremos carne.", "We want meat."),
                    ("¿Dónde está el menú?", "Where is the menu?"),
                ],
                "blanks": [
                    ("La", "cuenta", ", por favor.", "The check, please.", ["sopa", "carne"]),
                    ("El pescado es", "fresco", ".", "The fish is fresh.", ["fresca", "frescos"]),
                    ("¿Dónde", "está", "el menú?", "Where is the menu?", ["es", "eres"]),
                ],
            },
            {
                "title": "Numbers",
                "icon": "🔢",
                "words": [
                    ("uno", "one", "1️⃣"),
                    ("dos", "two", "2️⃣"),
                    ("tres", "three", "3️⃣"),
                    ("cuatro", "four", "4️⃣"),
                    ("cinco", "five", "5️⃣"),
                    ("seis", "six", "6️⃣"),
                    ("siete", "seven", "7️⃣"),
                    ("diez", "ten", "🔟"),
                ],
                "sentences": [
                    ("Yo tengo dos manzanas.", "I have two apples."),
                    ("Ella tiene tres perros.", "She has three dogs."),
                    ("Quiero cuatro galletas.", "I want four cookies.|I want four biscuits."),
                    ("Hay cinco niños.", "There are five children.|There are five boys.|There are five kids."),
                    ("Un café y dos tés.", "One coffee and two teas.|A coffee and two teas."),
                    ("Tengo seis años.", "I am six years old.|I'm six years old.|I am six."),
                ],
                "blanks": [
                    ("Yo tengo", "dos", "manzanas.", "I have two apples.", ["uno", "una"]),
                    ("Hay", "cinco", "niños.", "There are five children.", ["seis", "tres"]),
                    ("Ella", "tiene", "tres perros.", "She has three dogs.", ["tengo", "tienes"]),
                ],
            },
        ],
    },
    {
        "title": "Describe your family",
        "description": "Talk about family members, animals and colors",
        "color": "#1CB0F6",
        "guidebook": {
            "phrases": [
                {"text": "Mi madre es doctora.", "translation": "My mother is a doctor."},
                {"text": "Yo tengo un hermano.", "translation": "I have a brother."},
                {"text": "Yo tengo un perro.", "translation": "I have a dog."},
                {"text": "El gato es negro.", "translation": "The cat is black."},
                {"text": "El cielo es azul.", "translation": "The sky is blue."},
            ],
            "tips": [
                {
                    "title": "My: mi",
                    "body": "**Mi** means \"my\" and works for both genders.",
                    "table": {"headers": ["Spanish", "English"], "rows": [["mi padre", "my father"], ["mi madre", "my mother"]]},
                    "examples": [{"text": "Mi hermana es alta.", "translation": "My sister is tall."}],
                },
                {
                    "title": "Adjectives come after the noun",
                    "body": "Adjectives usually follow the noun and match its gender: **negro** for masculine nouns, **negra** for feminine nouns.",
                    "examples": [
                        {"text": "El gato negro.", "translation": "The black cat."},
                        {"text": "La casa blanca.", "translation": "The white house."},
                    ],
                },
                {
                    "title": "I have: tengo",
                    "body": "**Tengo** means \"I have\".",
                    "examples": [{"text": "Tengo un hermano.", "translation": "I have a brother."}],
                },
            ],
        },
        "skills": [
            {
                "title": "Family",
                "icon": "👪",
                "words": [
                    ("la madre", "the mother", "👩"),
                    ("el padre", "the father", "👨"),
                    ("el hermano", "the brother", "👦"),
                    ("la hermana", "the sister", "👧"),
                    ("el abuelo", "the grandfather", "👴"),
                    ("la abuela", "the grandmother", "👵"),
                    ("el hijo", "the son", "🧒"),
                    ("la familia", "the family", "👪"),
                ],
                "sentences": [
                    ("Mi madre es doctora.", "My mother is a doctor.|My mom is a doctor."),
                    ("Él es mi padre.", "He is my father.|He's my father.|He is my dad."),
                    ("Mi hermana es alta.", "My sister is tall."),
                    ("Tengo un hermano.", "I have a brother.|I have one brother."),
                    ("La abuela come pan.", "The grandmother eats bread.|Grandma eats bread.|The grandmother is eating bread."),
                    ("Mi abuelo bebe café.", "My grandfather drinks coffee.|My grandpa drinks coffee."),
                ],
                "blanks": [
                    ("Mi", "madre", "es doctora.", "My mother is a doctor.", ["padre", "hermano"]),
                    ("Tengo un", "hermano", ".", "I have a brother.", ["hermana", "madre"]),
                    ("Él es mi", "padre", ".", "He is my father.", ["madre", "abuela"]),
                ],
            },
            {
                "title": "Animals",
                "icon": "🐶",
                "words": [
                    ("el perro", "the dog", "🐶"),
                    ("el gato", "the cat", "🐱"),
                    ("el pájaro", "the bird", "🐦"),
                    ("el caballo", "the horse", "🐴"),
                    ("la vaca", "the cow", "🐮"),
                    ("el ratón", "the mouse", "🐭"),
                    ("el oso", "the bear", "🐻"),
                    ("el pez", "the fish", "🐠"),
                ],
                "sentences": [
                    ("El perro come carne.", "The dog eats meat.|The dog is eating meat."),
                    ("El gato bebe leche.", "The cat drinks milk.|The cat is drinking milk."),
                    ("Yo tengo un perro.", "I have a dog."),
                    ("El pájaro es pequeño.", "The bird is small.|The bird is little."),
                    ("La vaca es grande.", "The cow is big.|The cow is large."),
                    ("Mi gato es negro.", "My cat is black."),
                ],
                "blanks": [
                    ("El", "gato", "bebe leche.", "The cat drinks milk.", ["perro", "caballo"]),
                    ("La vaca es", "grande", ".", "The cow is big.", ["grandes", "pequeños"]),
                    ("Yo tengo un", "perro", ".", "I have a dog.", ["vaca", "gata"]),
                ],
            },
            {
                "title": "Colors",
                "icon": "🎨",
                "words": [
                    ("rojo", "red", "🟥"),
                    ("azul", "blue", "🟦"),
                    ("verde", "green", "🟩"),
                    ("amarillo", "yellow", "🟨"),
                    ("negro", "black", "⬛"),
                    ("blanco", "white", "⬜"),
                    ("morado", "purple", "🟪"),
                    ("naranja", "orange", "🟧"),
                ],
                "sentences": [
                    ("El perro es negro.", "The dog is black."),
                    ("La manzana es roja.", "The apple is red."),
                    ("Mi casa es blanca.", "My house is white."),
                    ("El cielo es azul.", "The sky is blue."),
                    ("Me gusta el verde.", "I like green.|I like the color green."),
                    ("El gato es amarillo.", "The cat is yellow."),
                ],
                "blanks": [
                    ("La manzana es", "roja", ".", "The apple is red.", ["rojo", "rojos"]),
                    ("El cielo es", "azul", ".", "The sky is blue.", ["verde", "negro"]),
                    ("Mi casa es", "blanca", ".", "My house is white.", ["blanco", "blancos"]),
                ],
            },
        ],
    },
]

ACHIEVEMENTS = [
    # code, title, metric, icon, color, [(threshold, gem_reward)], description template ({n} = threshold, {s} = plural "s")
    ("wildfire", "Wildfire", "streak", "🔥", "#FF4B4B", [(3, 10), (7, 20), (14, 40), (30, 80)], "Reach a {n} day streak"),
    ("sage", "Sage", "total_xp", "🦉", "#58CC02", [(100, 10), (250, 20), (500, 40), (1000, 80)], "Earn {n} XP"),
    ("scholar", "Scholar", "lessons_completed", "📚", "#1CB0F6", [(5, 10), (15, 20), (27, 40)], "Complete {n} lessons"),
    ("sharpshooter", "Sharpshooter", "perfect_lessons", "🎯", "#FF9600", [(3, 10), (10, 20), (20, 40)], "Complete {n} lessons with no mistakes"),
    ("conqueror", "Conqueror", "skills_completed", "🏆", "#FFC800", [(1, 10), (3, 20), (9, 50)], "Complete {n} skill{s}"),
    ("legendary", "Legendary", "legendary_skills", "👑", "#CE82FF", [(1, 20), (3, 50)], "Reach Legendary in {n} skill{s}"),
]

LEARNER = {
    "username": "learner",
    "display_name": "Alex",
    "avatar_color": "#1CB0F6",
}

# Rivals in the learner's Bronze league: (name, avatar color, XP earned per day this week[, status emoji])
LEAGUE_USERS = [
    ("María G.", "#FF9600", 35),
    ("Kenji", "#CE82FF", 28, "sunglasses"),
    ("Priya S.", "#FF4B4B", 22),
    ("Lucas", "#58CC02", 18),
    ("Sofia R.", "#2B70C9", 15),
    ("Omar", "#FFC800", 12, "popcorn"),
    ("Emma W.", "#00CD9C", 10),
    ("Noah", "#FF86D0", 8, "muscle"),
    ("Aisha", "#1CB0F6", 6),
    ("Mateo", "#A560E8", 5),
    ("Chloe", "#FF4B4B", 3),
    ("Ravi K.", "#58CC02", 2),
    ("Lena", "#FF9600", 0),
]
