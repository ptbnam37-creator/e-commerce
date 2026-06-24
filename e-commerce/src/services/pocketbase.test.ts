import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFileUrl, pb } from './pocketbase';
import { RecordModel } from 'pocketbase';

describe('getFileUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the URL from pb.files.getURL', () => {
    const mockRecord = { id: '123', collectionId: 'abc' } as RecordModel;
    const mockFilename = 'image.png';
    const expectedUrl = 'https://mock-url.com/image.png';

    vi.spyOn(pb.files, 'getURL').mockReturnValue(expectedUrl);

    const url = getFileUrl(mockRecord, mockFilename);

    expect(pb.files.getURL).toHaveBeenCalledWith(mockRecord, mockFilename);
    expect(url).toBe(expectedUrl);
  });

  it('should return an empty string if pb.files.getURL returns empty', () => {
    const mockRecord = { id: '123', collectionId: 'abc' } as RecordModel;
    const mockFilename = 'image.png';

    vi.spyOn(pb.files, 'getURL').mockReturnValue('');

    const url = getFileUrl(mockRecord, mockFilename);

    expect(pb.files.getURL).toHaveBeenCalledWith(mockRecord, mockFilename);
    expect(url).toBe('');
  });
});
