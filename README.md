# LRS (Lithuanian Parliament) Data Collection Tools

This repository contains tools and applications for collecting and processing data related to the Lithuanian Parliament (Seimas).

## Project Structure

### lrs_scraper/
A Next.js application that collects information about Parliament members and their staff, including:
- Member names and emails
- Consultant/Assistant names and emails
- Public Consultant names and emails

## Prerequisites

### macOS
1. Install Node.js (v16 or higher)
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
```

2. Install Git
```bash
# Using Homebrew
brew install git

# Or download from https://git-scm.com/
```

### Windows
1. Install Node.js (v16 or higher)
   - Download and install from https://nodejs.org/

2. Install Git
   - Download and install from https://git-scm.com/download/win

## Installation

1. Clone the repository
```bash
git clone https://github.com/vadimgumarov/LRS.git
cd LRS/lrs_scraper
```

2. Install dependencies
```bash
npm install
```

## Running the Application

1. Start the development server
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Click "Start Collection" button to begin the data collection process

## Data Collection Process

The application follows these steps:
1. Fetches the list of all Parliament members
2. For each member:
   - Extracts their email from profile page
   - Collects Consultant/Assistant information (if available)
   - Collects Public Consultant information (if available)

## Output Format

The application generates a CSV file with the following structure:
```csv
Role,Committee,Name,Email
Member,,Member Name,member@lrs.lt
Consultant / Assistant,,Assistant Name,assistant@lrs.lt
Public consultant,,Consultant Name,consultant@lrs.lt
```

## Development Approaches

### Successful Approaches
1. **Browser Automation with Puppeteer**
   - Successfully handles JavaScript-rendered content
   - Manages navigation between pages effectively
   - Handles Cloudflare email protection

2. **Data Collection Strategy**
   - Sequential processing to avoid overwhelming the server
   - Multiple selector attempts for reliable data extraction
   - Proper error handling and logging

3. **CSV Export**
   - Structured data format for easy analysis
   - Timestamp-based file naming for version control

### Technical Implementation Details
- Used Next.js for the web interface
- Implemented Puppeteer for browser automation
- Added detailed logging for debugging
- Included error handling for robustness
- Added CSV export functionality

## Troubleshooting

### Common Issues
1. **Module not found errors**
   - Solution: Make sure all dependencies are installed with `npm install`

2. **Browser launch failures**
   - Solution: Make sure Puppeteer is properly installed and system requirements are met

3. **Network timeouts**
   - Solution: Check internet connection and increase timeout values if necessary

### If the application fails to start:
1. Check Node.js version
```bash
node -v  # Should be v16 or higher
```

2. Clear npm cache
```bash
npm cache clean --force
```

3. Remove node_modules and reinstall
```bash
rm -rf node_modules
npm install
```

## Contributing

1. Create a new branch for your feature
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit
```bash
git add .
git commit -m "Description of your changes"
```

3. Push to your branch
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request on GitHub

## License

This project is licensed under the MIT License - see the LICENSE file for details.