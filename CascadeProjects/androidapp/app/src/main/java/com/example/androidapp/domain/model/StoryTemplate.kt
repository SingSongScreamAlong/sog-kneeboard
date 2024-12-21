package com.example.androidapp.domain.model

data class StoryTemplate(
    val id: String,
    val name: String,
    val description: String,
    val theme: String,
    val choices: List<StoryChoice>,
    val imagePrompts: List<String>,
    val ageRanges: List<String>
)

data class StoryChoice(
    val id: String,
    val question: String,
    val options: List<String>,
    val imagePromptTemplate: String? = null
)

// Predefined templates
object StoryTemplates {
    val templates = listOf(
        StoryTemplate(
            id = "adventure",
            name = "Magical Adventure",
            description = "Create an exciting adventure with magical creatures and special powers!",
            theme = "Fantasy",
            choices = listOf(
                StoryChoice(
                    id = "hero",
                    question = "Who is our hero?",
                    options = listOf(
                        "A brave young wizard",
                        "A curious fairy",
                        "A friendly dragon",
                        "A magical talking animal"
                    ),
                    imagePromptTemplate = "A cute and friendly {option} in a magical forest"
                ),
                StoryChoice(
                    id = "setting",
                    question = "Where does the story take place?",
                    options = listOf(
                        "Enchanted Forest",
                        "Crystal Castle",
                        "Cloud Kingdom",
                        "Rainbow Valley"
                    ),
                    imagePromptTemplate = "A magical {option} with sparkling lights and mystical atmosphere"
                ),
                StoryChoice(
                    id = "challenge",
                    question = "What challenge do they face?",
                    options = listOf(
                        "Finding a lost magical gem",
                        "Helping magical creatures",
                        "Solving a magical puzzle",
                        "Making new friends"
                    )
                )
            ),
            imagePrompts = listOf(
                "Show the hero's home",
                "Show the magical challenge",
                "Show the happy ending"
            ),
            ageRanges = listOf("4-8", "9-12")
        ),
        StoryTemplate(
            id = "animals",
            name = "Animal Friends",
            description = "Tell a heartwarming story about friendship between animals!",
            theme = "Friendship",
            choices = listOf(
                StoryChoice(
                    id = "mainCharacter",
                    question = "Who is our main character?",
                    options = listOf(
                        "A playful puppy",
                        "A shy kitten",
                        "A wise owl",
                        "A happy rabbit"
                    ),
                    imagePromptTemplate = "A cute and friendly {option} in a natural setting"
                ),
                StoryChoice(
                    id = "friend",
                    question = "Who becomes their new friend?",
                    options = listOf(
                        "A different animal",
                        "Another of the same animal",
                        "A group of forest animals",
                        "A human child"
                    )
                ),
                StoryChoice(
                    id = "activity",
                    question = "What do they do together?",
                    options = listOf(
                        "Go on an adventure",
                        "Help someone in need",
                        "Learn a new skill",
                        "Have a fun party"
                    ),
                    imagePromptTemplate = "Animals {option} together, showing friendship and joy"
                )
            ),
            imagePrompts = listOf(
                "Show the animals meeting",
                "Show them having fun together",
                "Show their friendship growing"
            ),
            ageRanges = listOf("4-8")
        ),
        StoryTemplate(
            id = "space",
            name = "Space Exploration",
            description = "Explore the wonders of space in this educational adventure!",
            theme = "Science",
            choices = listOf(
                StoryChoice(
                    id = "explorer",
                    question = "Who is exploring space?",
                    options = listOf(
                        "A young astronaut",
                        "A robot explorer",
                        "A space scientist",
                        "A group of friends"
                    ),
                    imagePromptTemplate = "A child-friendly {option} in a colorful space setting"
                ),
                StoryChoice(
                    id = "destination",
                    question = "Where are they going?",
                    options = listOf(
                        "A new planet",
                        "A space station",
                        "An asteroid belt",
                        "A distant galaxy"
                    ),
                    imagePromptTemplate = "A beautiful and safe {option} in space"
                ),
                StoryChoice(
                    id = "discovery",
                    question = "What do they discover?",
                    options = listOf(
                        "New forms of life",
                        "Amazing space phenomena",
                        "Ancient space artifacts",
                        "Beautiful cosmic wonders"
                    )
                )
            ),
            imagePrompts = listOf(
                "Show the space journey beginning",
                "Show the amazing discovery",
                "Show returning home with new knowledge"
            ),
            ageRanges = listOf("9-12", "13-16")
        )
    )
}
