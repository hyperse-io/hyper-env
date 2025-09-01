import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupEnv } from '../src/setup-env.js';

// Mock the helper functions
vi.mock('../src/helpers/search-env-files.js', () => ({
  searchEnvFiles: vi.fn(),
}));

vi.mock('../src/helpers/setup-dotenv.js', () => ({
  setupDotenv: vi.fn(),
}));

// Import the mocked functions
import { searchEnvFiles } from '../src/helpers/search-env-files.js';
import { setupDotenv } from '../src/helpers/setup-dotenv.js';

// Type the mocked functions
const mockSearchEnvFiles = vi.mocked(searchEnvFiles);
const mockSetupDotenv = vi.mocked(setupDotenv);

describe('setupEnv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call searchEnvFiles and setupDotenv with default parameters', () => {
    // Arrange
    const mockEnvFiles = ['/path/to/.env', '/path/to/.env.local'];
    mockSearchEnvFiles.mockReturnValue(mockEnvFiles);

    // Act
    setupEnv({});

    // Assert
    expect(mockSearchEnvFiles).toHaveBeenCalledWith({
      envKey: '',
      envFilePath: '',
    });
    expect(mockSetupDotenv).toHaveBeenCalledWith(mockEnvFiles);
    expect(mockSearchEnvFiles).toHaveBeenCalledTimes(1);
    expect(mockSetupDotenv).toHaveBeenCalledTimes(1);
  });

  it('should call searchEnvFiles and setupDotenv with custom envKey', () => {
    // Arrange
    const mockEnvFiles = ['/path/to/.env.staging', '/path/to/.env.local'];
    mockSearchEnvFiles.mockReturnValue(mockEnvFiles);
    const options = { envKey: 'APP_ENV' };

    // Act
    setupEnv(options);

    // Assert
    expect(mockSearchEnvFiles).toHaveBeenCalledWith({
      envKey: 'APP_ENV',
      envFilePath: '',
    });
    expect(mockSetupDotenv).toHaveBeenCalledWith(mockEnvFiles);
  });

  it('should call searchEnvFiles and setupDotenv with custom envFilePath', () => {
    // Arrange
    const mockEnvFiles = ['/path/to/custom.env', '/path/to/.env.local'];
    mockSearchEnvFiles.mockReturnValue(mockEnvFiles);
    const options = { envFilePath: 'custom.env' };

    // Act
    setupEnv(options);

    // Assert
    expect(mockSearchEnvFiles).toHaveBeenCalledWith({
      envKey: '',
      envFilePath: 'custom.env',
    });
    expect(mockSetupDotenv).toHaveBeenCalledWith(mockEnvFiles);
  });

  it('should call searchEnvFiles and setupDotenv with both custom envKey and envFilePath', () => {
    // Arrange
    const mockEnvFiles = ['/path/to/custom.env', '/path/to/.env.production'];
    mockSearchEnvFiles.mockReturnValue(mockEnvFiles);
    const options = {
      envKey: 'NODE_ENV',
      envFilePath: 'custom.env',
    };

    // Act
    setupEnv(options);

    // Assert
    expect(mockSearchEnvFiles).toHaveBeenCalledWith({
      envKey: 'NODE_ENV',
      envFilePath: 'custom.env',
    });
    expect(mockSetupDotenv).toHaveBeenCalledWith(mockEnvFiles);
  });

  it('should handle empty env files array', () => {
    // Arrange
    const mockEnvFiles: string[] = [];
    mockSearchEnvFiles.mockReturnValue(mockEnvFiles);

    // Act
    setupEnv({});

    // Assert
    expect(mockSearchEnvFiles).toHaveBeenCalledWith({
      envKey: '',
      envFilePath: '',
    });
    expect(mockSetupDotenv).toHaveBeenCalledWith([]);
  });

  it('should handle empty options object', () => {
    // Arrange
    const mockEnvFiles = ['/path/to/.env'];
    mockSearchEnvFiles.mockReturnValue(mockEnvFiles);

    // Act
    setupEnv({});

    // Assert
    expect(mockSearchEnvFiles).toHaveBeenCalledWith({
      envKey: '',
      envFilePath: '',
    });
    expect(mockSetupDotenv).toHaveBeenCalledWith(mockEnvFiles);
  });

  it('should handle partial options with only envKey', () => {
    // Arrange
    const mockEnvFiles = ['/path/to/.env.development'];
    mockSearchEnvFiles.mockReturnValue(mockEnvFiles);
    const options = { envKey: 'ENV' };

    // Act
    setupEnv(options);

    // Assert
    expect(mockSearchEnvFiles).toHaveBeenCalledWith({
      envKey: 'ENV',
      envFilePath: '',
    });
    expect(mockSetupDotenv).toHaveBeenCalledWith(mockEnvFiles);
  });

  it('should handle partial options with only envFilePath', () => {
    // Arrange
    const mockEnvFiles = ['/path/to/specific.env'];
    mockSearchEnvFiles.mockReturnValue(mockEnvFiles);
    const options = { envFilePath: 'specific.env' };

    // Act
    setupEnv(options);

    // Assert
    expect(mockSearchEnvFiles).toHaveBeenCalledWith({
      envKey: '',
      envFilePath: 'specific.env',
    });
    expect(mockSetupDotenv).toHaveBeenCalledWith(mockEnvFiles);
  });
});
